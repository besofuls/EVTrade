package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.entity.Order;
import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.repository.PaymentRepository;
import com.evtrading.swp391.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;

@Service
public class SellerPayoutService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    public void payoutForTransaction(Transaction transaction) {
        if (transaction == null || transaction.getOrder() == null) return;
        // Lấy seller, amount, commission như trong OrderService
        // Ghi nhận payment payout cho seller (không gọi API bên ngoài)
        Order order = transaction.getOrder();
        Listing listing = order.getListing();
        if (listing == null) return;

        // Lấy commission rate từ system config
        BigDecimal commissionRate = BigDecimal.valueOf(0.05); // mặc định 5%
        SystemConfig config = systemConfigRepository.findByConfigKey("COMMISSION_RATE").orElse(null);
        if (config != null) {
            try {
                commissionRate = new BigDecimal(config.getConfigValue());
            } catch (Exception ignored) {}
        }

        BigDecimal totalAmount = transaction.getTotalAmount();
        BigDecimal commission = totalAmount.multiply(commissionRate);
        BigDecimal sellerAmount = totalAmount.subtract(commission);

        // Ghi nhận payment payout cho seller (nội bộ, không chuyển tiền thật)
        Payment sellerPayment = new Payment();
        sellerPayment.setTransaction(transaction);
        sellerPayment.setAmount(sellerAmount);
        sellerPayment.setCommissionAmount(commission);
        sellerPayment.setSellerId(listing.getUser().getUserID());
        sellerPayment.setStatus("PAYOUT");
        sellerPayment.setPaidAt(new Date());
        sellerPayment.setMethod("INTERNAL");
        sellerPayment.setProvider("PLATFORM");
        sellerPayment.setTxnRef("PAYOUT_" + transaction.getTransactionID() + "_" + System.currentTimeMillis());

        paymentRepository.save(sellerPayment);
    }
}