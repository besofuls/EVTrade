package com.evtrading.swp391.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
public class ListingResponseDTO {
    private Integer id;
    private String title;
    private String description;
    private BigDecimal price;
    private String status;
    private Date createdAt;
    private Date startDate;
    private Date expiryDate;
    
    // Thông tin người bán
    private UserDTO seller;
    
    // Thông tin sản phẩm
    private String categoryName;
    private String brandName;
    private Object product; // VehicleDTO hoặc BatteryDTO
    
    // Hình ảnh
    private List<ListingImageDTO> images;
    private String primaryImageUrl;
}
