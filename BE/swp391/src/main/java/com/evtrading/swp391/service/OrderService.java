package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.OrderRequestDTO;
import com.evtrading.swp391.dto.OrderResponseDTO;
import com.evtrading.swp391.dto.PaymentRequestDTO;
import com.evtrading.swp391.dto.PaymentResponseDTO;
import com.evtrading.swp391.dto.TransactionReportDTO;
import com.evtrading.swp391.dto.VnpayCallbackResultDTO;
import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.Order;
import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.OrderRepository;
import com.evtrading.swp391.repository.TransactionRepository;
import com.evtrading.swp391.repository.PaymentRepository;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.repository.ContractRepository;
import com.evtrading.swp391.util.VnpayUtil;
import com.evtrading.swp391.dto.TransactionDTO;
import com.evtrading.swp391.dto.AdminOrderContractDTO;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Value("${vnpay.tmnCode}")
    private String vnpTmnCode;
    @Value("${vnpay.hashSecret}")
    private String vnpHashSecret;
    @Value("${vnpay.payUrl}")
    private String vnpPayUrl;
    @Value("${vnpay.returnUrl}")
    private String vnpReturnUrl;

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO dto, Authentication authentication) {
        logger.info("Creating order for listing ID: {}", dto.getListingId());

        // Lấy thông tin người mua từ token
        String username = authentication.getName();
        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Buyer not found: {}", username);
                    return new RuntimeException("Buyer not found");
                });

        // Lấy listing
        Listing listing = listingRepository.findById(dto.getListingId())
                .orElseThrow(() -> {
                    logger.error("Listing not found: {}", dto.getListingId());
                    return new RuntimeException("Listing not found");
                });

        // Kiểm tra listing có sẵn và người mua không phải người bán
        if (!"ACTIVE".equals(listing.getStatus())) {
            logger.error("Listing is not available: {}", listing.getStatus());
            throw new RuntimeException("Listing is not available for purchase");
        }
        if (buyer.getUserID().equals(listing.getUser().getUserID())) {
            logger.error("User {} cannot buy their own listing", username);
            throw new RuntimeException("Cannot buy your own listing");
        }

        // Tính tổng số tiền
        BigDecimal totalAmount = listing.getPrice().multiply(new BigDecimal(dto.getQuantity()));

        // Tạo Order
        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setQuantity(dto.getQuantity());
        order.setPrice(listing.getPrice());
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");
        order.setCreatedAt(new Date());
        Order savedOrder = orderRepository.save(order);

        // Tạo Transaction
        Transaction transaction = new Transaction();
        transaction.setOrder(savedOrder);
        transaction.setTotalAmount(totalAmount);
        transaction.setPaidAmount(BigDecimal.ZERO);
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(new Date());
        //////////////////////////////////////////////////////////////////////////////////
        // Thiết lập thời hạn thanh toán từ system config (đang để cố định 7 ngày)
        transaction.setDueTime(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Cập nhật Listing status
        listing.setStatus("PROCESSING");
        listingRepository.save(listing);

        // Tạo response DTO
        OrderResponseDTO response = new OrderResponseDTO();
        response.setOrderId(savedOrder.getOrderID());
        response.setBuyerId(savedOrder.getBuyer().getUserID());
        response.setSellerId(listing.getUser().getUserID());
        response.setListingId(savedOrder.getListing().getListingID());
        response.setQuantity(savedOrder.getQuantity());
        response.setPrice(savedOrder.getPrice());
        response.setTotalAmount(savedOrder.getTotalAmount());
        response.setStatus(savedOrder.getStatus());
        response.setTransactionId(savedTransaction.getTransactionID());
        response.setCreatedAt(savedOrder.getCreatedAt());

        return response;
    }

    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO dto, Authentication authentication) {
        logger.info("Creating payment for transaction ID: {}", dto.getTransactionId());

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Order order = transaction.getOrder();
        String txnRef;
        Integer orderId = null;

        if (order != null) {
            // Giao dịch có Order
            if (!user.getUserID().equals(order.getBuyer().getUserID())) {
                throw new RuntimeException("Not authorized to pay for this order");
            }
            BigDecimal remainingAmount = transaction.getTotalAmount().subtract(transaction.getPaidAmount());
            if (dto.getAmount().compareTo(remainingAmount) > 0) {
                throw new RuntimeException("Payment amount exceeds remaining amount");
            }
            txnRef = "ORDER_" + order.getOrderID() + "_" + System.currentTimeMillis();
            orderId = order.getOrderID();
        } else {
            // Giao dịch dịch vụ (không có Order)
            // Giả sử người dùng nào cũng có thể trả tiền cho giao dịch dịch vụ
            txnRef = "SERVICE_" + transaction.getTransactionID() + "_" + System.currentTimeMillis();
        }

        Payment payment = new Payment();
        payment.setTransaction(transaction);
        payment.setAmount(dto.getAmount());
        payment.setMethod(dto.getPaymentMethod());
        payment.setProvider(dto.getPaymentProvider());
        payment.setStatus("PENDING");
        payment.setPaidAt(new Date());
        payment.setTxnRef(txnRef);
        
        if (order != null && order.getListing() != null && order.getListing().getUser() != null) {
            payment.setSellerId(order.getListing().getUser().getUserID());
        }

        Payment savedPayment = paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(savedPayment.getPaymentID());
        response.setTransactionId(savedPayment.getTransaction().getTransactionID());
        response.setOrderId(orderId);
        response.setAmount(savedPayment.getAmount());
        response.setMethod(savedPayment.getMethod());
        response.setProvider(savedPayment.getProvider());
        response.setStatus(savedPayment.getStatus());
        response.setPaidAt(savedPayment.getPaidAt());

        if ("VNPAY".equalsIgnoreCase(dto.getPaymentMethod())) {
            String ipAddr = "127.0.0.1";
            String paymentUrl = VnpayUtil.createPaymentUrl(
                    vnpTmnCode, vnpHashSecret, vnpPayUrl, vnpReturnUrl,
                    dto.getAmount(), txnRef, ipAddr);
            response.setPaymentUrl(paymentUrl);
        }

        return response;
    }

    public List<OrderResponseDTO> getUserOrders(String username) {
        logger.info("Fetching orders for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByBuyerOrderByCreatedAtDesc(user);

        return orders.stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setOrderId(order.getOrderID());
            dto.setBuyerId(order.getBuyer().getUserID());
            
            Listing listing = order.getListing();
            if (listing != null) {
                dto.setListingId(listing.getListingID());
                // === DÒNG QUAN TRỌNG: LẤY TIÊU ĐỀ BÀI ĐĂNG ===
                dto.setListingTitle(listing.getTitle()); 
                if (listing.getUser() != null) {
                    dto.setSellerId(listing.getUser().getUserID());
                }
            }

            dto.setQuantity(order.getQuantity());
            dto.setPrice(order.getPrice());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());

            Transaction transaction = transactionRepository.findByOrder(order).orElse(null);
            if (transaction != null) {
                dto.setTransactionId(transaction.getTransactionID());
            }

            dto.setCreatedAt(order.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(Integer orderId, String username) {
        logger.info("Fetching order details for ID: {}", orderId);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getUserID().equals(user.getUserID()) &&
                !order.getListing().getUser().getUserID().equals(user.getUserID())) {
            logger.error("User {} attempted unauthorized access to order {}", username, orderId);
            throw new RuntimeException("Not authorized to view this order");
        }

        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrderID());
        dto.setBuyerId(order.getBuyer().getUserID());
        dto.setSellerId(order.getListing().getUser().getUserID());
        dto.setListingId(order.getListing().getListingID());
        dto.setQuantity(order.getQuantity());
        dto.setPrice(order.getPrice());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());

        Transaction transaction = transactionRepository.findByOrder(order).orElse(null);
        if (transaction != null) {
            dto.setTransactionId(transaction.getTransactionID());
        }

        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }

    public List<PaymentResponseDTO> getPaymentHistory(Integer transactionId, String username) {
        logger.info("Fetching payment history for transaction: {}", transactionId);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Order order = transaction.getOrder();
        if (order != null && !order.getBuyer().getUserID().equals(user.getUserID()) &&
                !order.getListing().getUser().getUserID().equals(user.getUserID())) {
            logger.error("User {} attempted unauthorized access to transaction {}", username, transactionId);
            throw new RuntimeException("Not authorized to view this transaction");
        }

        List<Payment> payments = paymentRepository.findByTransactionOrderByPaidAtDesc(transaction);

        return payments.stream().map(payment -> {
            PaymentResponseDTO dto = new PaymentResponseDTO();
            dto.setPaymentId(payment.getPaymentID());
            dto.setTransactionId(payment.getTransaction().getTransactionID());
            if (order != null) {
                dto.setOrderId(order.getOrderID());
            } else {
                dto.setOrderId(null);
            }
            dto.setAmount(payment.getAmount());
            dto.setMethod(payment.getMethod());
            dto.setProvider(payment.getProvider());
            dto.setStatus(payment.getStatus());
            dto.setPaidAt(payment.getPaidAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void processSuccessfulOrderPayment(Transaction transaction, Payment payment) {
        transaction.setPaidAmount(transaction.getPaidAmount().add(payment.getAmount()));
        
        Order order = transaction.getOrder();
        if (order != null) {
            // Logic cho giao dịch có Order
            if (transaction.getPaidAmount().compareTo(transaction.getTotalAmount()) >= 0) {
                transaction.setStatus("FULLY_PAID");
                order.setStatus("COMPLETED");
                orderRepository.save(order);

                Listing listing = order.getListing();
                if (listing != null) {
                    listing.setStartDate(null);
                    listing.setExpiryDate(null);
                    listing.setStatus("SOLD");
                    listingRepository.save(listing);
                }
            } else {
                transaction.setStatus("PARTIALLY_PAID");
            }
        } else {
            // Logic cho giao dịch dịch vụ (không có Order)
            if (transaction.getPaidAmount().compareTo(transaction.getTotalAmount()) >= 0) {
                transaction.setStatus("FULLY_PAID");
            } else {
                transaction.setStatus("PARTIALLY_PAID");
            }
        }
        transactionRepository.save(transaction);
    }

    public TransactionReportDTO generateTransactionReportByUserId(
            Integer userId,
            Date fromDate,
            Date toDate) {

        logger.info("Generating transaction report for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Transaction> transactions;
        if (fromDate != null && toDate != null) {
            transactions = transactionRepository.findByOrder_BuyerAndCreatedAtBetween(
                    user, fromDate, toDate);
        } else {
            transactions = transactionRepository.findByOrder_Buyer(user);
        }

        TransactionReportDTO report = new TransactionReportDTO();
        report.setUserId(user.getUserID());
        report.setUsername(user.getUsername());
        report.setReportGeneratedAt(new Date());
        report.setFromDate(fromDate);
        report.setToDate(toDate);

        report.setTotalOrders(transactions.size());

        int completedCount = 0;
        int pendingCount = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if ("FULLY_PAID".equals(t.getStatus())) {
                completedCount++;
            } else {
                pendingCount++;
            }
            totalRevenue = totalRevenue.add(t.getTotalAmount());
            totalPaid = totalPaid.add(t.getPaidAmount());
            totalRemaining = totalRemaining.add(
                    t.getTotalAmount().subtract(t.getPaidAmount()));
        }

        report.setCompletedOrders(completedCount);
        report.setPendingOrders(pendingCount);
        report.setTotalRevenue(totalRevenue);
        report.setTotalPaid(totalPaid);
        report.setTotalRemaining(totalRemaining);

        List<TransactionReportDTO.TransactionDetailDTO> details = transactions.stream()
                .map(t -> {
                    TransactionReportDTO.TransactionDetailDTO detail = new TransactionReportDTO.TransactionDetailDTO();
                    detail.setTransactionId(t.getTransactionID());
                    // An toàn vì query đã lọc transaction có order
                    detail.setOrderId(t.getOrder().getOrderID());
                    detail.setListingTitle(t.getOrder().getListing().getTitle());
                    detail.setTotalAmount(t.getTotalAmount());
                    detail.setPaidAmount(t.getPaidAmount());
                    detail.setStatus(t.getStatus());
                    detail.setCreatedAt(t.getCreatedAt());

                    List<Payment> payments = paymentRepository
                            .findByTransactionOrderByPaidAtDesc(t);
                    detail.setNumberOfPayments(payments.size());

                    return detail;
                })
                .collect(Collectors.toList());

        report.setTransactions(details);

        logger.info("Generated report for user {} with {} transactions",
                user.getUsername(), transactions.size());

        return report;
    }

    public List<TransactionDTO> getCurrentUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByOrder_Buyer(user);

        return transactions.stream()
                .filter(t -> "PENDING".equals(t.getStatus()) || "PARTIALLY_PAID".equals(t.getStatus()))
                .map(t -> {
                    TransactionDTO dto = new TransactionDTO();
                    dto.setTransactionId(t.getTransactionID());
                    dto.setCreatedAt(t.getCreatedAt());
                    dto.setExpiredAt(t.getDueTime());
                    dto.setStatus(t.getStatus());
                    dto.setTotalAmount(t.getTotalAmount());
                    dto.setOrderId(t.getOrder().getOrderID());
                    dto.setPaidAmount(t.getPaidAmount());

                    return dto;
                }).collect(Collectors.toList());
    }

    public List<TransactionDTO> getCurrentUserFullyPaidTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByOrder_Buyer(user);

        return transactions.stream()
                .filter(t -> "FULLY_PAID".equals(t.getStatus()))
                .map(t -> {
                    TransactionDTO dto = new TransactionDTO();
                    dto.setTransactionId(t.getTransactionID());
                    dto.setCreatedAt(t.getCreatedAt());
                    dto.setExpiredAt(t.getDueTime());
                    dto.setStatus(t.getStatus());
                    dto.setTotalAmount(t.getTotalAmount());
                    dto.setOrderId(t.getOrder().getOrderID());
                    dto.setPaidAmount(t.getPaidAmount());
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<TransactionDTO> getAllTransactionsForAdmin() {
        List<Transaction> transactions = transactionRepository.findAll();
        return transactions.stream().map(t -> {
            TransactionDTO dto = new TransactionDTO();
            dto.setTransactionId(t.getTransactionID());
            dto.setCreatedAt(t.getCreatedAt());
            dto.setExpiredAt(t.getDueTime());
            dto.setStatus(t.getStatus());
            dto.setTotalAmount(t.getTotalAmount());
            dto.setPaidAmount(t.getPaidAmount());

            Order order = t.getOrder();
            if (order != null) {
                dto.setOrderId(order.getOrderID());

                User buyer = order.getBuyer();
                if (buyer != null) {
                    dto.setBuyerUsername(buyer.getUsername());
                    dto.setBuyerEmail(buyer.getEmail());
                }

                Listing listing = order.getListing();
                if (listing != null) {
                    dto.setListingTitle(listing.getTitle());
                    User seller = listing.getUser();
                    if (seller != null) {
                        dto.setSellerUsername(seller.getUsername());
                        dto.setSellerEmail(seller.getEmail());
                    }
                }
            } else {
                dto.setOrderId(null);
                if ("LISTING_EXTEND".equals(t.getReferenceType()) && t.getReferenceID() != null) {
                    listingRepository.findById(t.getReferenceID()).ifPresent(listing -> {
                        dto.setListingTitle(listing.getTitle());
                        User user = listing.getUser();
                        if (user != null) {
                            dto.setSellerUsername(user.getUsername());
                            dto.setSellerEmail(user.getEmail());
                        }
                    });
                } else {
                    dto.setListingTitle("Dịch vụ: " + (t.getType() != null ? t.getType() : "Không xác định"));
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    private AdminOrderContractDTO buildAdminOrderContractDto(Order order) {
        AdminOrderContractDTO dto = new AdminOrderContractDTO();
        dto.setOrderId(order.getOrderID());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalAmount(order.getTotalAmount());

        User buyer = order.getBuyer();
        if (buyer != null) {
            dto.setBuyerId(buyer.getUserID());
            dto.setBuyerUsername(buyer.getUsername());
            dto.setBuyerEmail(buyer.getEmail());
        }

        Listing listing = order.getListing();
        if (listing != null) {
            dto.setListingId(listing.getListingID());
            dto.setListingTitle(listing.getTitle());
            User seller = listing.getUser();
            if (seller != null) {
                dto.setSellerId(seller.getUserID());
                dto.setSellerUsername(seller.getUsername());
                dto.setSellerEmail(seller.getEmail());
            }
        }

        contractRepository.findByOrder(order).ifPresent(contract -> {
            dto.setContractId(contract.getContractID());
            dto.setContractStatus(contract.getStatus());
        });

        return dto;
    }

    public List<AdminOrderContractDTO> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::buildAdminOrderContractDto)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getPaymentHistoryForAdmin(Integer transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        List<Payment> payments = paymentRepository.findByTransactionOrderByPaidAtDesc(transaction);

        return payments.stream().map(payment -> {
            PaymentResponseDTO dto = new PaymentResponseDTO();
            dto.setPaymentId(payment.getPaymentID());
            dto.setTransactionId(payment.getTransaction().getTransactionID());
            dto.setAmount(payment.getAmount());
            dto.setMethod(payment.getMethod());
            dto.setProvider(payment.getProvider());
            dto.setStatus(payment.getStatus());
            dto.setPaidAt(payment.getPaidAt());

            Order order = payment.getTransaction().getOrder();
            if (order != null) {
                dto.setOrderId(order.getOrderID());
            } else {
                dto.setOrderId(null);
            }

            return dto;
        }).collect(Collectors.toList());
    }
}

