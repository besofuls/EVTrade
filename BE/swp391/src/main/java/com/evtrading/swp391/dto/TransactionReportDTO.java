package com.evtrading.swp391.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class TransactionReportDTO {
    // Thông tin tổng quan
    private Integer userId;
    private String username;
    private Date reportGeneratedAt;
    private Date fromDate;
    private Date toDate;
    
    // Thống kê tổng hợp
    private Integer totalOrders;
    private Integer completedOrders;
    private Integer pendingOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalPaid;
    private BigDecimal totalRemaining;
    
    // Chi tiết giao dịch
    private List<TransactionDetailDTO> transactions;
    
    // Getters and Setters
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public Date getReportGeneratedAt() { return reportGeneratedAt; }
    public void setReportGeneratedAt(Date reportGeneratedAt) { this.reportGeneratedAt = reportGeneratedAt; }
    
    public Date getFromDate() { return fromDate; }
    public void setFromDate(Date fromDate) { this.fromDate = fromDate; }
    
    public Date getToDate() { return toDate; }
    public void setToDate(Date toDate) { this.toDate = toDate; }
    
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    
    public Integer getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Integer completedOrders) { this.completedOrders = completedOrders; }
    
    public Integer getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Integer pendingOrders) { this.pendingOrders = pendingOrders; }
    
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    
    public BigDecimal getTotalRemaining() { return totalRemaining; }
    public void setTotalRemaining(BigDecimal totalRemaining) { this.totalRemaining = totalRemaining; }
    
    public List<TransactionDetailDTO> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionDetailDTO> transactions) { this.transactions = transactions; }
    
    // Inner class cho chi tiết từng giao dịch
    public static class TransactionDetailDTO {
        private Integer transactionId;
        private Integer orderId;
        private String listingTitle;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private String status;
        private Date createdAt;
        private Integer numberOfPayments;
        
        // Getters and Setters
        public Integer getTransactionId() { return transactionId; }
        public void setTransactionId(Integer transactionId) { this.transactionId = transactionId; }
        
        public Integer getOrderId() { return orderId; }
        public void setOrderId(Integer orderId) { this.orderId = orderId; }
        
        public String getListingTitle() { return listingTitle; }
        public void setListingTitle(String listingTitle) { this.listingTitle = listingTitle; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public Date getCreatedAt() { return createdAt; }
        public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
        
        public Integer getNumberOfPayments() { return numberOfPayments; }
        public void setNumberOfPayments(Integer numberOfPayments) { this.numberOfPayments = numberOfPayments; }
    }
}
