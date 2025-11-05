package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Battery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer batteryID;

    // Many batteries can belong to one category (e.g., lithium-ion, lead-acid, etc.)
    @ManyToOne
    @JoinColumn(name = "categoryID", nullable = false)
    private Category category;


    // Many batteries sdsscan belong to one brand (e.g., Panasonic, LG, etc.)
    @ManyToOne
    @JoinColumn(name = "brandID", nullable = false)
    private Brand brand;

    private BigDecimal capacity;
    private BigDecimal voltage;
    private Integer cycleCount;
    private BigDecimal price;
    private String condition;

    // Getters and Setters
    public Integer getBatteryID() { return batteryID; }
    public void setBatteryID(Integer batteryID) { this.batteryID = batteryID; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }
    public BigDecimal getVoltage() { return voltage; }
    public void setVoltage(BigDecimal voltage) { this.voltage = voltage; }
    public Integer getCycleCount() { return cycleCount; }
    public void setCycleCount(Integer cycleCount) { this.cycleCount = cycleCount; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
}