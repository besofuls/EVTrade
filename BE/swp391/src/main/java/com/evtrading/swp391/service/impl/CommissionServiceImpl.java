package com.evtrading.swp391.service.impl;

import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.service.CommissionService;
import com.evtrading.swp391.service.SystemConfigService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service // Đánh dấu đây là một Spring Bean
public class CommissionServiceImpl implements CommissionService {

    private final SystemConfigService systemConfigService;

    public CommissionServiceImpl(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @Override
    public BigDecimal calculateCommission(Payment payment) {
        // Sử dụng service đã có để lấy tỉ lệ hoa hồng, tránh trùng lặp logic
        BigDecimal commissionRate = systemConfigService.getCommissionRate();

        if (payment == null || payment.getAmount() == null) {
            return BigDecimal.ZERO;
        }

        return payment.getAmount().multiply(commissionRate);
    }
}