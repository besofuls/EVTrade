package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderItemID;

    @ManyToOne
    @JoinColumn(name = "orderID", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "listingID", nullable = false)
    private Listing listing;

    private Integer quantity;
    private BigDecimal price;

    // Getters and Setters
    public Integer getOrderItemID() { return orderItemID; }
    public void setOrderItemID(Integer orderItemID) { this.orderItemID = orderItemID; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
}