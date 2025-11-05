package com.evtrading.swp391.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderRequestDTO {
    @NotNull(message = "Listing ID cannot be null")
    private Integer listingId;

    @Positive(message = "Quantity must be positive")
    private Integer quantity = 1;

    // Getters and Setters
    public Integer getListingId() { return listingId; }
    public void setListingId(Integer listingId) { this.listingId = listingId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}