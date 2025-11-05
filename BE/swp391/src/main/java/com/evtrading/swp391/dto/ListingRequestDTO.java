package com.evtrading.swp391.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ListingRequestDTO {
    private String title;
    private String description;
    private BigDecimal price;
    private Integer categoryId;
    private Integer brandId;
    
    // Thông tin xe (nếu là xe)
    private VehicleDTO vehicle;
    
    // Thông tin pin (nếu là pin)
    private BatteryDTO battery;
    
    // URLs của ảnh
    private List<String> imageURLs;
    private Integer primaryImageIndex; // Chỉ số của ảnh chính trong list
}
