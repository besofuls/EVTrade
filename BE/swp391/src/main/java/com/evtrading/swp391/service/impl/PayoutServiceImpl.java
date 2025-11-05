package com.evtrading.swp391.service.impl;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.service.PayoutService;
import com.evtrading.swp391.util.BankClient;

@Service
public class PayoutServiceImpl implements PayoutService {

    private final BankClient bankClient;

    public PayoutServiceImpl(BankClient bankClient) {
        this.bankClient = bankClient;
    }

    @Override
    public void queuePayout(Integer sellerId, BigDecimal netAmount, Integer paymentId) {
        bankClient.prepareTransfer(sellerId, netAmount, paymentId);
    }

    @Override
    public boolean executePayout(Payment payment) {
        return bankClient.executeTransfer(payment.getSellerId(), payment.getPaymentID());
    }
}