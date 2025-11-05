package com.evtrading.swp391.security;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
@Service
public class FacebookAuthVerifier {
    @Value("${spring.security.oauth2.client.registration.facebook.client-id}")
    private String appId;
    @Value("${spring.security.oauth2.client.registration.facebook.client-secret}")
    private String appSecret;

    private final RestTemplate rest = new RestTemplate();

    /** Trả về dữ liệu /me (id,name,email,picture) nếu token hợp lệ, ngược lại null */
    @SuppressWarnings("unchecked")
    public Map<String, Object> verify(String userAccessToken) {
        try {
            String appToken = appId + "|" + appSecret;
            String debugUrl = "https://graph.facebook.com/debug_token?input_token=" +
                    userAccessToken + "&access_token=" + appToken;

            Map<String, Object> debug = rest.getForObject(debugUrl, Map.class);
            if (debug == null) return null;
            Map<String, Object> data = (Map<String, Object>) debug.get("data");
            if (data == null || Boolean.FALSE.equals(data.get("is_valid"))) return null;

            String meUrl = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + userAccessToken;
            return rest.getForObject(meUrl, Map.class);
        } catch (Exception e) {
            return (Map<String, Object>) ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED);
        }
    }
}