package com.evtrading.swp391.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BatteryDTO {
    private Integer batteryId; // Null khi tạo mới
    private BigDecimal capacity;
    private BigDecimal voltage;
    private Integer cycleCount;
    private BigDecimal price;
    private String condition;
}
