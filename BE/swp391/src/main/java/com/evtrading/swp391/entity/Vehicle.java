package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vehicleID;

    // Many vehicles can belong to one category (e.g., sedan, SUV, etc.)
    @ManyToOne
    @JoinColumn(name = "categoryID", nullable = false)
    private Category category;

    // Many vehicles can belong to one brand (e.g., Tesla, Nissan, etc.)
    @ManyToOne
    @JoinColumn(name = "brandID", nullable = false)
    private Brand brand;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String model;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String color;
    private Integer year;
    private BigDecimal price;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String condition;

    // Getters and Setters
    public Integer getVehicleID() { return vehicleID; }
    public void setVehicleID(Integer vehicleID) { this.vehicleID = vehicleID; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
}