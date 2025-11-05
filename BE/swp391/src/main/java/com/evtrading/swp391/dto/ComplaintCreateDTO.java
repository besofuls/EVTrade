package com.evtrading.swp391.dto;

public class ComplaintCreateDTO {
    private Integer userId;
    private Integer listingId;
    private String content;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Integer getListingId() { return listingId; }
    public void setListingId(Integer listingId) { this.listingId = listingId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    // Ghi chú: DTO đơn giản để nhận request từ frontend khi user gửi khiếu nại
    // {
    //   "userId": 1,
    //   "listingId": 42,
    //   "content": "Mô tả lỗi..."
    // }
}
