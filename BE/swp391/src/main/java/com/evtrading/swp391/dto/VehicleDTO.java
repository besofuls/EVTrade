package com.evtrading.swp391.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class VehicleDTO {
    private Integer vehicleId; // Null khi tạo mới
    private String model;
    private String color;
    private Integer year;
    private BigDecimal price;
    private String condition;
}
