package com.evtrading.swp391.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequestDTO {
    private String provider;   // "google", "facebook"
    private String accessToken;
}

