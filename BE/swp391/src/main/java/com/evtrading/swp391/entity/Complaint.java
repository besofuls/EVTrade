package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer complaintID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "listingID", nullable = false)
    private Listing listing;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    private String status;
    private Date createdAt;
    private Date resolvedAt;

    // Getters and Setters
    public Integer getComplaintID() { return complaintID; }
    public void setComplaintID(Integer complaintID) { this.complaintID = complaintID; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Date resolvedAt) { this.resolvedAt = resolvedAt;}
    
    /*
     * Ghi chú luồng Complaint:
     * - Khi người mua gặp vấn đề, frontend POST lên /api/complaints với userId, listingId, content.
     * - Backend sẽ tạo record mới với status = "Pending" và createdAt là thời điểm hiện tại.
     * - Admin/Moderator sẽ gọi GET /api/complaints?status=Pending để lấy danh sách khiếu nại chờ xử lý.
     * - Khi admin xử lý xong, gọi PUT /api/complaints/{id}/resolve với body chứa { "status": "Resolved" }
     *   Backend sẽ cập nhật status và resolvedAt.
     *
     * Lưu ý mapping:
     * - Quan hệ ManyToOne tới User và Listing: trường user/listing bắt buộc (nullable = false)
     * - Trường content dùng NVARCHAR(MAX) để lưu nội dung tiếng Việt.
     */
}