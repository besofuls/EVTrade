package com.evtrading.swp391.entity;

import jakarta.persistence.*;

@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer profileID;

    @OneToOne
    @JoinColumn(name = "userID", unique = true)
    private User user;

    private String fullName;
    private String phone;
    private String address;

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
}