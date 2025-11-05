package com.evtrading.swp391.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.Date;

@Entity
@Table(name = "social_accounts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"provider","provider_user_id"}))
public class SocialAccount {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false)               // liên kết về users sẵn có
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false, length = 20)
  private String provider;                   // GOOGLE|FACEBOOK

  @Column(name="provider_user_id", nullable=false, length=150)
  private String providerUserId;

  private String email;
  private String avatarUrl;
  private Date createdAt = new Date();

   // Getters and Setters
  public Integer getId() {
    return id;
  }
  public void setId(Integer id) {
    this.id = id;
  }
  public User getUser() {
    return user;
  }
  public void setUser(User user) {
    this.user = user;
  }
  public String getProvider() {
    return provider;
  }
  public void setProvider(String provider) {
    this.provider = provider;
  }
  public String getProviderUserId() {
    return providerUserId;
  }
  public void setProviderUserId(String providerUserId) {
    this.providerUserId = providerUserId;
  }
  public String getEmail() {
    return email;
  }
  public void setEmail(String email) {
    this.email = email;
  }
  public String getAvatarUrl() {
    return avatarUrl;
  }
  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }
  public Date getCreatedAt() {
    return createdAt;
  }
  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

}
