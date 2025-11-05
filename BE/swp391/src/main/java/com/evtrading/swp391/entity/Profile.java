package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer profileID;

    @OneToOne
    @JoinColumn(name = "userID", unique = true)
    private User user;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fullName;
    private String phone;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String address;

    private Date dateOfBirth;         // Ngày sinh (tùy chọn)
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String gender;            // Nam/Nữ/Khác

    private Date createdAt;           // Ngày tạo profile
    private Date updatedAt;           // Ngày cập nhật gần nhất


    // Getters and Setters
    public Integer getProfileID() { return profileID; }
    public void setProfileID(Integer profileID) { this.profileID = profileID; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Date getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(Date dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}