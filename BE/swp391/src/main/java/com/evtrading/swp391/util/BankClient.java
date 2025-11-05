package com.evtrading.swp391.util;

import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BankClient {

    private static final Logger log = LoggerFactory.getLogger(BankClient.class);

    public void prepareTransfer(Integer sellerId, BigDecimal amount, Integer paymentId) {
        log.info("Prepare payout seller={}, amount={}, paymentId={}", sellerId, amount, paymentId);
    }

    public boolean executeTransfer(Integer sellerId, Integer paymentId) {
        log.info("Execute payout seller={}, paymentId={}", sellerId, paymentId);
        return true;
    }
}