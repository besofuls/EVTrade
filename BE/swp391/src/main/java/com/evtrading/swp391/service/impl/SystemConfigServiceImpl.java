package com.evtrading.swp391.service.impl;

import java.math.BigDecimal;
import java.util.Date;
import org.springframework.stereotype.Service;
import com.evtrading.swp391.repository.SystemConfigRepository;
import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.service.SystemConfigService;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    private static final BigDecimal DEFAULT_RATE = new BigDecimal("0.05");
    private static final int DEFAULT_EXTEND_PRICE = 5000;
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

    @Override
    public int getExtendPricePerDay() {
        return systemConfigRepository.findByConfigKey("EXTEND_PRICE_PER_DAY")
                .map(SystemConfig::getConfigValue)
                .map(this::parsePositiveInt)
                .filter(price -> price > 0)
                .orElse(DEFAULT_EXTEND_PRICE);
    }

    @Override
    public int updateExtendPricePerDay(int pricePerDay) {
        if (pricePerDay <= 0) {
            throw new IllegalArgumentException("Giá gia hạn mỗi ngày phải lớn hơn 0.");
        }

        SystemConfig config = systemConfigRepository.findByConfigKey("EXTEND_PRICE_PER_DAY")
                .orElseGet(() -> {
                    SystemConfig sc = new SystemConfig();
                    sc.setConfigKey("EXTEND_PRICE_PER_DAY");
                    return sc;
                });

        config.setConfigValue(String.valueOf(pricePerDay));
        config.setUpdatedAt(new Date());
        systemConfigRepository.save(config);

        return pricePerDay;
    }

    private int parsePositiveInt(String value) {
        if (value == null) {
            return -1;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ignored) {
            return -1;
        }
    }
}