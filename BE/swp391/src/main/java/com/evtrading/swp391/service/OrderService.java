package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.OrderRequestDTO;
import com.evtrading.swp391.dto.OrderResponseDTO;
import com.evtrading.swp391.dto.PaymentRequestDTO;
import com.evtrading.swp391.dto.PaymentResponseDTO;
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
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
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
        transaction.setDueTime(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Cập nhật Listing status
        listing.setStatus("SOLD");
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
        BigDecimal newPaidAmount = transaction.getPaidAmount().add(dto.getAmount());
        if (newPaidAmount.compareTo(transaction.getTotalAmount()) > 0) {
            logger.error("Payment amount {} exceeds remaining amount {}", 
                         dto.getAmount(), transaction.getTotalAmount().subtract(transaction.getPaidAmount()));
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

        // Cập nhật Transaction
        transaction.setPaidAmount(newPaidAmount);
        transaction.setStatus(newPaidAmount.equals(transaction.getTotalAmount()) 
                             ? "FULLY_PAID" : "PARTIALLY_PAID");
        transaction.setTransactionDate(new Date());
        transactionRepository.save(transaction);

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
}