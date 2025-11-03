package com.evtrading.swp391.service.impl;

import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import com.evtrading.swp391.repository.SystemConfigRepository;
import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.service.SystemConfigService;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    private static final BigDecimal DEFAULT_RATE = new BigDecimal("0.05");
    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigServiceImpl(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @Override
    public BigDecimal getCommissionRate() {
        return systemConfigRepository.findByConfigKey("COMMISSION_RATE")
                .map(SystemConfig::getConfigValue)
                .map(value -> {
                    try {
                        return new BigDecimal(value);
                    } catch (NumberFormatException ignored) {
                        return DEFAULT_RATE;
                    }
                })
                .orElse(DEFAULT_RATE);
    }
}