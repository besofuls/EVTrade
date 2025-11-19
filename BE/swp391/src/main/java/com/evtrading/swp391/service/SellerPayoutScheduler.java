package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Transaction;
import com.evtrading.swp391.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SellerPayoutScheduler {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SellerPayoutService sellerPayoutService;

    // Chạy mỗi 30 phút
    @Scheduled(fixedRate = 1800000)
    public void autoPayoutSeller() {
        List<Transaction> transactions = transactionRepository.findByStatusAndPayoutDoneFalse("FULLY_PAID");
        for (Transaction transaction : transactions) {
            // CHỈ TẠO PAYMENT CHO TRANSACTION CÓ ORDERID (KHÔNG PHẢI DỊCH VỤ)
            if (transaction.getOrder() != null) {
                sellerPayoutService.payoutForTransaction(transaction);
                transaction.setPayoutDone(true);
                transactionRepository.save(transaction);
            }
        }
    }
}