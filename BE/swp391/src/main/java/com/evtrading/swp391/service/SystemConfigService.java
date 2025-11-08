package com.evtrading.swp391.service;

import java.math.BigDecimal;

public interface SystemConfigService {
    BigDecimal getCommissionRate();
    int getExtendPricePerDay();
    int updateExtendPricePerDay(int pricePerDay);
}