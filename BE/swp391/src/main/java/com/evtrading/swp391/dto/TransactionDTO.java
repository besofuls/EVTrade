package com.evtrading.swp391.dto;
import java.math.BigDecimal;
import java.util.Date;

public class TransactionDTO {


    private Integer transactionId;
    private Date createdAt;
    private Date expiredAt;
    private String status;
    private BigDecimal totalAmount;
    private Integer orderId;
    private BigDecimal paidAmount;
    private String buyerUsername;
    private String buyerEmail;
    private String sellerUsername;
    private String sellerEmail;
    private String listingTitle;

    public TransactionDTO() {
    }
    public TransactionDTO(Integer transactionId, Date createdAt, Date expiredAt, String status, BigDecimal totalAmount,
            Integer orderId, BigDecimal paidAmount) {
        this.transactionId = transactionId;
        this.createdAt = createdAt;
        this.expiredAt = expiredAt;
        this.status = status;
        this.totalAmount = totalAmount;
        this.orderId = orderId;
        this.paidAmount = paidAmount;
    }

    public TransactionDTO(Integer transactionId, Date createdAt, Date expiredAt, String status, BigDecimal totalAmount,
            Integer orderId, BigDecimal paidAmount, String buyerUsername, String buyerEmail, String sellerUsername,
            String sellerEmail, String listingTitle) {
        this.transactionId = transactionId;
        this.createdAt = createdAt;
        this.expiredAt = expiredAt;
        this.status = status;
        this.totalAmount = totalAmount;
        this.orderId = orderId;
        this.paidAmount = paidAmount;
        this.buyerUsername = buyerUsername;
        this.buyerEmail = buyerEmail;
        this.sellerUsername = sellerUsername;
        this.sellerEmail = sellerEmail;
        this.listingTitle = listingTitle;
    }

    // getters & setters
    public Integer getTransactionId() {
        return transactionId;
    }
    public void setTransactionId(Integer transactionId) {
        this.transactionId = transactionId;
    }
    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public Date getExpiredAt() {
        return expiredAt;
    }
    public void setExpiredAt(Date expiredAt) {
        this.expiredAt = expiredAt;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    public Integer getOrderId() {
        return orderId;
    }
    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }
    public BigDecimal getPaidAmount() {
        return paidAmount;
    }
    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }
    public String getBuyerUsername() {
        return buyerUsername;
    }
    public void setBuyerUsername(String buyerUsername) {
        this.buyerUsername = buyerUsername;
    }
    public String getBuyerEmail() {
        return buyerEmail;
    }
    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }
    public String getSellerUsername() {
        return sellerUsername;
    }
    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }
    public String getSellerEmail() {
        return sellerEmail;
    }
    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }
    public String getListingTitle() {
        return listingTitle;
    }
    public void setListingTitle(String listingTitle) {
        this.listingTitle = listingTitle;
    }


}
