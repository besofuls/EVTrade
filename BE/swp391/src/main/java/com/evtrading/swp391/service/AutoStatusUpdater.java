package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.PaymentRepository;
import com.evtrading.swp391.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.List;

@Service
public class AutoStatusUpdater {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Chạy mỗi 30 phút
    @Scheduled(fixedRate = 1800000)
    public void updateExpiredListingsPaymentsTransactions() {
        Date now = new Date();

        // Cập nhật listing hết hạn
        List<Listing> expiredListings = listingRepository.findByExpiryDateBeforeAndStatusNot(now, "EXPIRED");
        for (Listing listing : expiredListings) {
            listing.setStatus("EXPIRED");
            listingRepository.save(listing);
        }

        // Cập nhật payment hết hạn (ví dụ: nếu quá 15p mà vẫn PENDING thì set EXPIRED)
        Date paymentDeadline = new Date(now.getTime() - 15 * 60 * 1000); // 15p trước
        List<Payment> expiredPayments = paymentRepository.findByStatusAndPaidAtBefore("PENDING", paymentDeadline);
        for (Payment payment : expiredPayments) {
            String status = payment.getStatus();
            // Chỉ xử lý nếu chưa COMPLETED, FAILED, PAID và đang PENDING
            if ("PENDING".equals(status)) {
                payment.setStatus("EXPIRED");
                paymentRepository.save(payment);
            }
        }

        // Cập nhật transaction hết hạn
        List<Transaction> expiredTransactions = transactionRepository.findByDueTimeBeforeAndStatusNot(now, "EXPIRED");
        for (Transaction transaction : expiredTransactions) {
            // CHỈ CHUYỂN TRẠNG THÁI NẾU CHƯA FULLY_PAID
            if (!"FULLY_PAID".equals(transaction.getStatus())) {
                transaction.setStatus("EXPIRED");
                transactionRepository.save(transaction);
            }
        }
    }
}