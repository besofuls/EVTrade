package com.evtrading.swp391.entity;

import jakarta.persistence.*;

@Entity
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer brandID;

    @Column(nullable = false, unique = true)
    private String brandName;

    // Getters and Setters
    public Integer getBrandID() { return brandID; }
    public void setBrandID(Integer brandID) { this.brandID = brandID; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
}