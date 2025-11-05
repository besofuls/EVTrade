package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.VnpayCallbackResultDTO;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.repository.PaymentRepository;
import com.evtrading.swp391.repository.SystemConfigRepository;
import com.evtrading.swp391.repository.TransactionRepository;
import com.evtrading.swp391.util.VnpayUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class VnpayService {

    private static final Logger logger = LoggerFactory.getLogger(VnpayService.class);

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final OrderService orderService;
    private final ListingService listingService;
    private final SystemConfigRepository systemConfigRepository;

    @Value("${vnpay.hashSecret}")
    private String vnpHashSecret;

    public VnpayService(PaymentRepository paymentRepository, TransactionRepository transactionRepository, OrderService orderService, ListingService listingService, SystemConfigRepository systemConfigRepository) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.orderService = orderService;
        this.listingService = listingService;
        this.systemConfigRepository = systemConfigRepository;
    }

    @Transactional
    public VnpayCallbackResultDTO handleVnpayCallback(Map<String, String> params) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpSecureHash = params.get("vnp_SecureHash");

        // 1. Xác thực chữ ký
        Map<String, String> paramsForHash = new HashMap<>(params);
        paramsForHash.remove("vnp_SecureHash");
        String hashData = VnpayUtil.buildHashData(paramsForHash);
        String myHash = VnpayUtil.hmacSHA512(vnpHashSecret, hashData);

        if (!myHash.equalsIgnoreCase(vnpSecureHash)) {
            logger.error("VNPAY callback: Invalid secure hash!");
            return new VnpayCallbackResultDTO(false, "Chữ ký không hợp lệ", "UNKNOWN");
        }

        // 2. Tìm payment bằng txnRef
        Payment payment = paymentRepository.findByTxnRef(vnpTxnRef).orElse(null);
        if (payment == null) {
            logger.error("VNPAY callback: Payment not found with txnRef: {}", vnpTxnRef);
            return new VnpayCallbackResultDTO(false, "Không tìm thấy giao dịch", "UNKNOWN");
        }

        // 3. Kiểm tra trạng thái thanh toán
        if (!"PENDING".equals(payment.getStatus())) {
            logger.warn("VNPAY callback: Payment already processed: {}", payment.getPaymentID());
            // Trả về thành công để VNPAY không gửi lại IPN, nhưng không xử lý logic
            return new VnpayCallbackResultDTO(true, "Giao dịch đã được xử lý.", payment.getTransaction().getReferenceType());
        }

        // 4. Xử lý nếu thanh toán thất bại từ VNPAY
        if (!"00".equals(vnpResponseCode)) {
            logger.warn("VNPAY callback: Payment failed, response code: {}", vnpResponseCode);
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            String reason = "Thanh toán thất bại. Mã lỗi: " + vnpResponseCode;
            return new VnpayCallbackResultDTO(false, reason, payment.getTransaction().getReferenceType());
        }

        // 5. Xử lý thanh toán thành công
        payment.setStatus("PAID");
        payment.setPaidAt(new Date());
        paymentRepository.save(payment);

        Transaction transaction = payment.getTransaction();
        transaction.setStatus("PAID");
        transactionRepository.save(transaction);

        // 6. Phân luồng xử lý dựa trên loại giao dịch
        String transactionType = transaction.getReferenceType();
        if ("LISTING_EXTEND".equals(transactionType)) {
            // Lấy giá gia hạn một cách an toàn
            int pricePerDay = systemConfigRepository.findByConfigKey("EXTEND_PRICE_PER_DAY")
                    .map(config -> Integer.parseInt(config.getConfigValue()))
                    .orElseThrow(() -> new IllegalStateException("Chưa cấu hình giá gia hạn (EXTEND_PRICE_PER_DAY) trong hệ thống."));

            // Kiểm tra giá tiền trước khi chia để tránh lỗi
            if (pricePerDay > 0) {
                int days = transaction.getTotalAmount().intValue() / pricePerDay;
                // Gọi service để gia hạn
                listingService.extendListingExpiry(transaction.getReferenceID(), days);
                logger.info("VNPAY callback: Listing {} extended by {} days.", transaction.getReferenceID(), days);
            } else {
                logger.error("Giá gia hạn mỗi ngày đang được cấu hình là 0. Không thể thực hiện gia hạn.");
            }
        } else { // Mặc định là thanh toán cho đơn hàng
            orderService.processSuccessfulOrderPayment(transaction, payment);
            // Kiểm tra order tồn tại trước khi ghi log để tránh NullPointerException
            if (transaction.getOrder() != null) {
                logger.info("VNPAY callback: Payment completed for order {}", transaction.getOrder().getOrderID());
            } else {
                logger.warn("VNPAY callback: Payment completed for a transaction without an order. Txn ID: {}", transaction.getTransactionID());
            }
        }

        return new VnpayCallbackResultDTO(true, "Thanh toán thành công!", transactionType);
    }
}