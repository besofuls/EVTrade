package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer listingID;

    // Many listings can be created by one user
    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    // Many listings can belong to one category (e.g., vehicle, battery, etc.)
    @ManyToOne
    @JoinColumn(name = "categoryID", nullable = false)
    private Category category;

    // Many listings can belong to one brand (e.g., Tesla, Nissan, Panasonic, etc.)
    @ManyToOne
    @JoinColumn(name = "brandID", nullable = false)
    private Brand brand;

    // A listing can be for either a vehicle or a battery, but not both
    @OneToOne
    @JoinColumn(name = "vehicleID")
    private Vehicle vehicle;

    @OneToOne
    @JoinColumn(name = "batteryID")
    private Battery battery;

    @Column(nullable = false,columnDefinition = "NVARCHAR(MAX)")
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String status;
    private Date createdAt;
    private Date startDate;
    private Date expiryDate;
    private Integer extendedTimes;
    
    // Trung bình đánh giá (average rating) cho listing, cập nhật khi có review mới
    private Double averageRating;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    // Getters and Setters
    public Integer getListingID() { return listingID; }
    public void setListingID(Integer listingID) { this.listingID = listingID;}
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public Battery getBattery() { return battery; }
    public void setBattery(Battery battery) { this.battery = battery; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Date expiryDate) { this.expiryDate = expiryDate;}
    public Integer getExtendedTimes() { return extendedTimes; }
    public void setExtendedTimes(Integer extendedTimes) { this.extendedTimes = extendedTimes;}
    public String getRejectionReason() {
        return rejectionReason;
    }
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
}