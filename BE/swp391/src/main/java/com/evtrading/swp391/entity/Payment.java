package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentID;

    @ManyToOne
    @JoinColumn(name = "transactionID", nullable = false)
    private Transaction transaction;

    private BigDecimal amount;
    private String method;
    private String provider;
    private String status;
    private Date paidAt;

    // Getters and Setters
    public Integer getPaymentID() { return paymentID; }
    public void setPaymentID(Integer paymentID) { this.paymentID = paymentID; }
    public Transaction getTransaction() { return transaction; }
    public void setTransaction(Transaction transaction) { this.transaction = transaction; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getPaidAt() { return paidAt; }
    public void setPaidAt(Date paidAt) { this.paidAt = paidAt; }
    
}