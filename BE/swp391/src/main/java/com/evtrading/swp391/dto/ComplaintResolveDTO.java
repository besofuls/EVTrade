package com.evtrading.swp391.dto;

public class ComplaintResolveDTO {
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // Ghi chú: DTO dùng khi admin resolve complaint.
    // Body ví dụ: { "status": "Resolved" } hoặc { "status": "Rejected" }
}
