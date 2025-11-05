package com.evtrading.swp391.mapper;

import com.evtrading.swp391.dto.*;
import com.evtrading.swp391.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ListingMapper {

    /**
     * Chuyển đổi từ Listing entity sang ListingResponseDTO
     */
    public ListingResponseDTO toDto(Listing listing, List<ListingImage> images) {
        if (listing == null) {
            return null;
        }
        
        ListingResponseDTO dto = new ListingResponseDTO();
        
        // Thông tin cơ bản
        dto.setId(listing.getListingID());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setStatus(listing.getStatus());
        dto.setPrice(listing.getPrice());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setStartDate(listing.getStartDate());
        dto.setExpiryDate(listing.getExpiryDate());
        
        // Thông tin brand - SET STRING thay vì object
        if (listing.getBrand() != null) {
            dto.setBrandName(listing.getBrand().getBrandName());
        }
        
        // Thông tin category - SET STRING thay vì object
        if (listing.getCategory() != null) {
            dto.setCategoryName(listing.getCategory().getCategoryName());
        }
        
        // Thông tin user
        if (listing.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(listing.getUser().getUserID());
            userDTO.setUsername(listing.getUser().getUsername());
            // Các thông tin khác nếu cần
            dto.setSeller(userDTO);
        }
        
        // Xử lý ảnh
        if (images != null && !images.isEmpty()) {
            List<ListingImageDTO> imageDTOs = images.stream()
                .map(this::toImageDto)
                .collect(Collectors.toList());
            
            dto.setImages(imageDTOs);
            
            // Tìm ảnh chính
            String primaryUrl = images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ListingImage::getImageURL) // Sửa từ getUrl thành getImageURL
                .orElseGet(() -> images.get(0).getImageURL()); // Sửa từ getUrl thành getImageURL
            
            dto.setPrimaryImageUrl(primaryUrl);
        } else {
            dto.setImages(new ArrayList<>());
        }
        
        // Thông tin xe hoặc pin - SET PRODUCT dưới dạng Object
        if (listing.getVehicle() != null) {
            VehicleDTO vehicleDTO = new VehicleDTO();
            vehicleDTO.setVehicleId(listing.getVehicle().getVehicleID());
            vehicleDTO.setModel(listing.getVehicle().getModel());
            vehicleDTO.setColor(listing.getVehicle().getColor());
            vehicleDTO.setYear(listing.getVehicle().getYear());
            vehicleDTO.setPrice(listing.getVehicle().getPrice());
            vehicleDTO.setCondition(listing.getVehicle().getCondition());
            dto.setProduct(vehicleDTO);
        } else if (listing.getBattery() != null) {
            BatteryDTO batteryDTO = new BatteryDTO();
            batteryDTO.setBatteryId(listing.getBattery().getBatteryID());
            batteryDTO.setCapacity(listing.getBattery().getCapacity());
            batteryDTO.setVoltage(listing.getBattery().getVoltage());
            batteryDTO.setCycleCount(listing.getBattery().getCycleCount());
            batteryDTO.setPrice(listing.getBattery().getPrice());
            batteryDTO.setCondition(listing.getBattery().getCondition());
            dto.setProduct(batteryDTO);
        }
        
        return dto;
    }
    
    /**
     * Chuyển đổi từ ListingImage entity sang ListingImageDTO
     */
    private ListingImageDTO toImageDto(ListingImage image) {
        if (image == null) {
            return null;
        }
        
        ListingImageDTO dto = new ListingImageDTO();
        dto.setId(image.getImageID());
        dto.setUrl(image.getImageURL()); 
        dto.setIsPrimary(image.getIsPrimary());
        
        return dto;
    }
}