package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderID;

    @ManyToOne
    @JoinColumn(name = "buyerID", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "listingID", nullable = false)
    private Listing listing;

    private Integer quantity;
    private BigDecimal price;
    private String status;
    private BigDecimal totalAmount;
    private Date createdAt;

    // Getters and Setters
    public Integer getOrderID() { return orderID; }
    public void setOrderID(Integer orderID) { this.orderID = orderID; }
    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}