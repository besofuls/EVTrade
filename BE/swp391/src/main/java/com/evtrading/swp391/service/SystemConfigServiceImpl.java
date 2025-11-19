package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Override
    public BigDecimal getCommissionRate() {
        SystemConfig config = systemConfigRepository.findByConfigKey("COMMISSION_RATE").orElse(null);
        if (config != null) {
            try {
                return new BigDecimal(config.getConfigValue());
            } catch (Exception e) {
                return BigDecimal.valueOf(0.05); // fallback mặc định
            }
        }
        return BigDecimal.valueOf(0.05);
    }

    @Override
    public int getExtendPricePerDay() {
        SystemConfig config = systemConfigRepository.findByConfigKey("EXTEND_PRICE_PER_DAY").orElse(null);
        if (config != null) {
            try {
                return Integer.parseInt(config.getConfigValue());
            } catch (Exception e) {
                return 5000; // fallback mặc định
            }
        }
        return 5000;
    }

    @Override
    public int updateExtendPricePerDay(int pricePerDay) {
        SystemConfig config = systemConfigRepository.findByConfigKey("EXTEND_PRICE_PER_DAY").orElse(null);
        if (config != null) {
            config.setConfigValue(String.valueOf(pricePerDay));
            systemConfigRepository.save(config);
            return pricePerDay;
        }
        return -1;
    }
}