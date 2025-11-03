package com.evtrading.swp391.dto;

public class VnpayCallbackResultDTO {
    private boolean success;
    private String message;
    private String transactionType; // Thêm trường này để phân biệt loại giao dịch


    public VnpayCallbackResultDTO() {}

    public VnpayCallbackResultDTO(boolean success, String message, String transactionType) {
        this.success = success;
        this.message = message;
        this.transactionType = transactionType;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getTransactionType() {
        return transactionType;
    }
    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}