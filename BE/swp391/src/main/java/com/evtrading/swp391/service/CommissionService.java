package com.evtrading.swp391.service;

import java.math.BigDecimal;
import com.evtrading.swp391.entity.Payment;

public interface CommissionService {
    BigDecimal calculateCommission(Payment payment);
}