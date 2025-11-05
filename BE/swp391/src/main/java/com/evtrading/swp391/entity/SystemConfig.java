package com.evtrading.swp391.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer configID;

    @Column(nullable = false, unique = true)
    private String configKey;

    private String configValue;
    private Date updatedAt;

    // Getters and Setters
    public Integer getConfigID() { return configID; }
    public void setConfigID(Integer configID) { this.configID = configID; }
    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    
}