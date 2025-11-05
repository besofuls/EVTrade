package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.OrderRequestDTO;
import com.evtrading.swp391.dto.OrderResponseDTO;
import com.evtrading.swp391.dto.PaymentRequestDTO;
import com.evtrading.swp391.dto.PaymentResponseDTO;
import com.evtrading.swp391.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @Operation(summary = "Lấy chi tiết đơn hàng", description = "Xem thông tin chi tiết của một đơn hàng")
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
}