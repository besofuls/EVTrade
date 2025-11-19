package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer transactionID;

    @OneToOne
    @JoinColumn(name = "orderID", unique = true)
    private Order order;

    // Dùng khi transaction không gắn với order (dịch vụ, phí, quảng cáo...)
    private String type;           // ORDER, SERVICE, ADVERT, FEE
    private String referenceType;  // LISTING_EXTEND, PROMOTION, SUBSCRIPTION
    private Integer referenceID;

    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private Date transactionDate;
    private String status;
    private Date createdAt;
    private Date dueTime;
    private Boolean payoutDone = false;

    // Getters and Setters
    public Integer getTransactionID() { return transactionID; }
    public void setTransactionID(Integer transactionID) { this.transactionID = transactionID; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public Integer getReferenceID() { return referenceID; }
    public void setReferenceID(Integer referenceID) { this.referenceID = referenceID; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount;}
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public Date getTransactionDate() { return transactionDate; }
    public void setTransactionDate(Date transactionDate) { this.transactionDate = transactionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getDueTime() { return dueTime; }
    public void setDueTime(Date dueTime) { this.dueTime = dueTime; }
    public Boolean getPayoutDone() { return payoutDone; }
    public void setPayoutDone(Boolean payoutDone) { this.payoutDone = payoutDone; }
}