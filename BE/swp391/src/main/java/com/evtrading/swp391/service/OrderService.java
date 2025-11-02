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
import com.evtrading.swp391.util.VnpayUtil;
import com.evtrading.swp391.dto.TransactionDTO;

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

        // Lấy thông tin người dùng từ token
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        // Lấy transaction
        Transaction transaction = transactionRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> {
                    logger.error("Transaction not found: {}", dto.getTransactionId());
                    return new RuntimeException("Transaction not found");
                });

        // Kiểm tra người dùng có quyền thanh toán (là người mua của order)
        Order order = transaction.getOrder();
        if (!user.getUserID().equals(order.getBuyer().getUserID())) {
            logger.error("User {} is not authorized to pay for order {}", username, order.getOrderID());
            throw new RuntimeException("Not authorized to pay for this order");
        }

        // Kiểm tra số tiền thanh toán hợp lệ
        BigDecimal remainingAmount = transaction.getTotalAmount().subtract(transaction.getPaidAmount());
        if (dto.getAmount().compareTo(remainingAmount) > 0) {
            logger.error("Payment amount {} exceeds remaining amount {}",
                    dto.getAmount(), remainingAmount);
            throw new RuntimeException("Payment amount exceeds remaining amount");
        }

        // Tạo Payment
        Payment payment = new Payment();
        payment.setTransaction(transaction);
        payment.setAmount(dto.getAmount());
        payment.setMethod(dto.getPaymentMethod());
        payment.setProvider(dto.getPaymentProvider());
        payment.setStatus("PENDING");
        payment.setPaidAt(new Date());
        Payment savedPayment = paymentRepository.save(payment);

        // Nếu chọn phương thức VNPAY thì sinh URL và trả về cho FE
        if ("VNPAY".equalsIgnoreCase(dto.getPaymentMethod())) {
            String ipAddr = "127.0.0.1"; // Lấy từ request thực tế nếu cần
            String paymentUrl = VnpayUtil.createPaymentUrl(
                    vnpTmnCode, vnpHashSecret, vnpPayUrl, vnpReturnUrl,
                    dto.getAmount(), savedPayment.getPaymentID().toString(), ipAddr);

            PaymentResponseDTO response = new PaymentResponseDTO();
            response.setPaymentId(savedPayment.getPaymentID());
            response.setTransactionId(savedPayment.getTransaction().getTransactionID());
            response.setOrderId(order.getOrderID());
            response.setAmount(savedPayment.getAmount());
            response.setMethod(savedPayment.getMethod());
            response.setProvider(savedPayment.getProvider());
            response.setStatus(savedPayment.getStatus());
            response.setPaidAt(savedPayment.getPaidAt());
            // Thêm trường paymentUrl (bổ sung vào DTO nếu chưa có)
            response.setPaymentUrl(paymentUrl);

            return response;
        }

        // Tạo response DTO
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(savedPayment.getPaymentID());
        response.setTransactionId(savedPayment.getTransaction().getTransactionID());
        response.setOrderId(order.getOrderID());
        response.setAmount(savedPayment.getAmount());
        response.setMethod(savedPayment.getMethod());
        response.setProvider(savedPayment.getProvider());
        response.setStatus(savedPayment.getStatus());
        response.setPaidAt(savedPayment.getPaidAt());

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
            dto.setSellerId(order.getListing().getUser().getUserID());
            dto.setListingId(order.getListing().getListingID());
            dto.setQuantity(order.getQuantity());
            dto.setPrice(order.getPrice());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());

            // Lấy transaction ID nếu có
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

        // Kiểm tra người dùng có quyền xem đơn hàng
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

        // Lấy transaction
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

        // Kiểm tra người dùng có quyền xem thanh toán
        if (!transaction.getOrder().getBuyer().getUserID().equals(user.getUserID()) &&
                !transaction.getOrder().getListing().getUser().getUserID().equals(user.getUserID())) {
            logger.error("User {} attempted unauthorized access to transaction {}", username, transactionId);
            throw new RuntimeException("Not authorized to view this transaction");
        }

        List<Payment> payments = paymentRepository.findByTransactionOrderByPaidAtDesc(transaction);

        return payments.stream().map(payment -> {
            PaymentResponseDTO dto = new PaymentResponseDTO();
            dto.setPaymentId(payment.getPaymentID());
            dto.setTransactionId(payment.getTransaction().getTransactionID());
            dto.setOrderId(payment.getTransaction().getOrder().getOrderID());
            dto.setAmount(payment.getAmount());
            dto.setMethod(payment.getMethod());
            dto.setProvider(payment.getProvider());
            dto.setStatus(payment.getStatus());
            dto.setPaidAt(payment.getPaidAt());
            return dto;
        }).collect(Collectors.toList());
    }

    public VnpayCallbackResultDTO handleVnpayCallback(Map<String, String> params) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpTransactionNo = params.get("vnp_TransactionNo");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpSecureHash = params.get("vnp_SecureHash");

        Map<String, String> paramsForHash = new HashMap<>(params);
        paramsForHash.remove("vnp_SecureHash");
        String hashData = VnpayUtil.buildHashData(paramsForHash);
        String myHash = VnpayUtil.hmacSHA512(vnpHashSecret, hashData);
        if (!myHash.equalsIgnoreCase(vnpSecureHash)) {
            logger.error("VNPAY callback: Invalid secure hash!");
            return new VnpayCallbackResultDTO(false, "Chữ ký bảo mật không hợp lệ!");
        }

        Integer paymentId;
        try {
            paymentId = Integer.parseInt(vnpTxnRef);
        } catch (Exception e) {
            logger.error("VNPAY callback: Invalid paymentId {}", vnpTxnRef);
            return new VnpayCallbackResultDTO(false, "Mã giao dịch không hợp lệ!");
        }
        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            logger.error("VNPAY callback: Payment not found: {}", paymentId);
            return new VnpayCallbackResultDTO(false, "Không tìm thấy giao dịch thanh toán!");
        }

        if (!"00".equals(vnpResponseCode)) {
            logger.warn("VNPAY callback: Payment failed, response code: {}", vnpResponseCode);
            if ("PENDING".equals(payment.getStatus())) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
            }
            String reason = "Thanh toán thất bại. Mã lỗi: " + vnpResponseCode;
            return new VnpayCallbackResultDTO(false, reason);
        }

        if (!"PENDING".equals(payment.getStatus())) {
            logger.warn("VNPAY callback: Payment already processed: {}", paymentId);
            return new VnpayCallbackResultDTO(false, "Giao dịch đã được xử lý trước đó.");
        }

        Transaction transaction = payment.getTransaction();
        Order order = transaction.getOrder();

        payment.setStatus("COMPLETED");
        paymentRepository.save(payment);

        transaction.setPaidAmount(transaction.getPaidAmount().add(payment.getAmount()));
        if (transaction.getPaidAmount().compareTo(transaction.getTotalAmount()) >= 0) {
            transaction.setStatus("FULLY_PAID");
            order.setStatus("COMPLETED");
            orderRepository.save(order);

            Listing listing = order.getListing();
            if (listing != null) {
                listing.setStatus("SOLD");
                listingRepository.save(listing);
            }
        } else {
            transaction.setStatus("PARTIALLY_PAID");
        }
        transactionRepository.save(transaction);

        logger.info("VNPAY callback: Payment completed for order {}", order.getOrderID());
        return new VnpayCallbackResultDTO(true, "Thanh toán thành công!");
    }

    /**
     * Tạo Transaction Report cho BẤT KỲ user nào (dành cho Admin)
     * 
     * @param userId   ID của user cần tạo report
     * @param fromDate Ngày bắt đầu
     * @param toDate   Ngày kết thúc
     * @return TransactionReportDTO
     */
    public TransactionReportDTO generateTransactionReportByUserId(
            Integer userId,
            Date fromDate,
            Date toDate) {

        logger.info("Generating transaction report for user ID: {}", userId);

        // Tìm user theo ID (không dùng authentication)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found: " + userId);
                });

        // Lấy danh sách transactions của user này
        List<Transaction> transactions;
        if (fromDate != null && toDate != null) {
            transactions = transactionRepository.findByOrder_BuyerAndCreatedAtBetween(
                    user, fromDate, toDate);
        } else {
            transactions = transactionRepository.findByOrder_Buyer(user);
        }

        // Tạo report DTO (logic giống hệt generateTransactionReport)
        TransactionReportDTO report = new TransactionReportDTO();
        report.setUserId(user.getUserID());
        report.setUsername(user.getUsername());
        report.setReportGeneratedAt(new Date());
        report.setFromDate(fromDate);
        report.setToDate(toDate);

        // Tính toán thống kê
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

        // Chi tiết giao dịch
        List<TransactionReportDTO.TransactionDetailDTO> details = transactions.stream()
                .map(t -> {
                    TransactionReportDTO.TransactionDetailDTO detail = new TransactionReportDTO.TransactionDetailDTO();
                    detail.setTransactionId(t.getTransactionID());
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

        // Chỉ lấy status FULLY_PAID
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
            dto.setOrderId(t.getOrder().getOrderID());
            dto.setPaidAmount(t.getPaidAmount());

            // Thêm thông tin người mua, người bán, tiêu đề bài đăng
            Order order = t.getOrder();
            if (order != null) {
                User buyer = order.getBuyer();
                if (buyer != null) {
                    dto.setBuyerUsername(buyer.getUsername());
                    dto.setBuyerEmail(buyer.getEmail());
                }
                Listing listing = order.getListing();
                if (listing != null) {
                    User seller = listing.getUser();
                    if (seller != null) {
                        dto.setSellerUsername(seller.getUsername());
                        dto.setSellerEmail(seller.getEmail());
                    }
                    dto.setListingTitle(listing.getTitle());
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getPaymentHistoryForAdmin(Integer transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        List<Payment> payments = paymentRepository.findByTransactionOrderByPaidAtDesc(transaction);

        return payments.stream().map(payment -> {
            PaymentResponseDTO dto = new PaymentResponseDTO();
            dto.setPaymentId(payment.getPaymentID());
            dto.setTransactionId(payment.getTransaction().getTransactionID());
            dto.setOrderId(payment.getTransaction().getOrder().getOrderID());
            dto.setAmount(payment.getAmount());
            dto.setMethod(payment.getMethod());
            dto.setProvider(payment.getProvider());
            dto.setStatus(payment.getStatus());
            dto.setPaidAt(payment.getPaidAt());
            return dto;
        }).collect(Collectors.toList());
    }

}