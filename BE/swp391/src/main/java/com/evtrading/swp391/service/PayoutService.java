package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Payment;

public interface PayoutService {
    void queuePayout(Integer sellerId, java.math.BigDecimal netAmount, Integer paymentId);
    boolean executePayout(Payment payment);
}