package com.evtrading.swp391.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.evtrading.swp391.dto.OrderRequestDTO;
import com.evtrading.swp391.dto.OrderResponseDTO;
import com.evtrading.swp391.dto.PaymentRequestDTO;
import com.evtrading.swp391.dto.PaymentResponseDTO;
import com.evtrading.swp391.dto.TransactionReportDTO;
import com.evtrading.swp391.dto.TransactionDTO;
import com.evtrading.swp391.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api")
@Tag(name = "Orders and Payments", description = "API để quản lý đơn hàng và thanh toán")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @Operation(summary = "Tạo đơn hàng mới", description = "Tạo đơn hàng từ một bài đăng listing")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/orders")
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody OrderRequestDTO orderRequest,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized attempt to create order");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            OrderResponseDTO createdOrder = orderService.createOrder(orderRequest, authentication);
            logger.info("Order created successfully: {}", createdOrder.getOrderId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            logger.error("Error creating order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Tạo thanh toán", description = "Tạo thanh toán cho một giao dịch")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/payments")
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO paymentRequest,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized attempt to create payment");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            PaymentResponseDTO createdPayment = orderService.createPayment(paymentRequest, authentication);
            logger.info("Payment created successfully: {}", createdPayment.getPaymentId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
        } catch (RuntimeException e) {
            logger.error("Error creating payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Lấy danh sách đơn hàng", description = "Lấy tất cả đơn hàng của người dùng hiện tại")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = authentication.getName();
            List<OrderResponseDTO> orders = orderService.getUserOrders(username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Lấy chi tiết đơn hàng của người dùng hiện tại", description = "Xem thông tin chi tiết của một đơn hàng")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable Integer id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = authentication.getName();
            OrderResponseDTO order = orderService.getOrderById(id, username);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @Operation(summary = "Lấy lịch sử thanh toán", description = "Xem lịch sử thanh toán của một giao dịch")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/transactions/{id}/payments")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentHistory(
            @PathVariable Integer id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = authentication.getName();
            List<PaymentResponseDTO> payments = orderService.getPaymentHistory(id, username);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            logger.error("Error getting payment history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * /**
     * Admin xem transaction report của BẤT KỲ user nào
     * 
     * @param userId   ID của user cần xem report (bắt buộc)
     * @param fromDate Ngày bắt đầu (optional)
     * @param toDate   Ngày kết thúc (optional)
     */
    @Operation(summary = "Admin: Tạo báo cáo giao dịch cho bất kỳ user nào", description = "Admin có thể xem report giao dịch của mọi user trong hệ thống bằng cách truyền userId")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN
    @GetMapping("/admin/transactions/report")
    public ResponseEntity<TransactionReportDTO> generateReportForAnyUser(
            @RequestParam Integer userId, // Bắt buộc phải có userId
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,
            Authentication authentication) {

        try {
            // Gọi service với userId được chỉ định
            TransactionReportDTO report = orderService.generateTransactionReportByUserId(
                    userId,
                    fromDate,
                    toDate);

            logger.info("Admin {} generated report for user ID: {}",
                    authentication.getName(), userId);

            return ResponseEntity.ok(report);

        } catch (RuntimeException e) {
            logger.error("Error generating report for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @Operation(summary = "Lấy tất cả transaction của user hiện tại")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getCurrentUserTransactions(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            String username = authentication.getName();
            List<TransactionDTO> transactions = orderService.getCurrentUserTransactions(username);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error getting transactions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Lấy tất cả transaction đã thanh toán đủ của user hiện tại")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/transactions/fully-paid")
    public ResponseEntity<List<TransactionDTO>> getCurrentUserFullyPaidTransactions(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            String username = authentication.getName();
            List<TransactionDTO> transactions = orderService.getCurrentUserFullyPaidTransactions(username);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error getting fully paid transactions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Admin: Lấy toàn bộ transaction trong hệ thống", description = "Chỉ ADMIN được phép xem tất cả transaction")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/transactions")
    public ResponseEntity<List<TransactionDTO>> getAllTransactionsForAdmin(Authentication authentication) {
        try {
            List<TransactionDTO> transactions = orderService.getAllTransactionsForAdmin();
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error getting all transactions for admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Admin: Xem lịch sử thanh toán của bất kỳ transaction", description = "Chỉ ADMIN được phép xem lịch sử thanh toán của mọi transaction")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/transactions/{id}/payments")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentHistoryForAdmin(@PathVariable Integer id) {
        try {
            List<PaymentResponseDTO> payments = orderService.getPaymentHistoryForAdmin(id);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            logger.error("Error getting payment history for admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

}