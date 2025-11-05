package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.AuthResponseDTO;
import com.evtrading.swp391.dto.SocialLoginRequestDTO;
import com.evtrading.swp391.entity.Role;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.RoleRepository;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.security.FacebookAuthVerifier;
import com.evtrading.swp391.security.GoogleAuthVerifier;
import com.evtrading.swp391.security.JwtProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus; // Add this import for HttpStatus

import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final GoogleAuthVerifier googleVerifier;
    private final FacebookAuthVerifier fbVerifier;
    private final JwtProvider jwtProvider;

    @Value("${GOOGLE_CLIENT_ID}")
    private String googleClientId;

    private final RestTemplate rest = new RestTemplate();

    private String generateUniqueUsername(String base) {
        if (base == null || base.isBlank()) {
            base = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }

        // Xử lý Unicode name đúng cách
        String candidate = base.trim()
                .replaceAll("[\\p{Space}]+", "_") // thay space bằng underscore
                .replaceAll("[^\\p{L}\\p{N}_-]", "") // giữ chữ cái Unicode, số và _ -
                .toLowerCase(Locale.ROOT);

        // Đảm bảo độ dài tối thiểu
        if (candidate.length() < 3) {
            candidate = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }

        // Đảm bảo không trùng
        String unique = candidate;
        int i = 1;
        while (userRepo.findByUsername(unique).isPresent()) {
            unique = candidate + "_" + i++;
        }
        
        // Convert về UTF-8 để đảm bảo encoding
        return new String(unique.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }

    /**
     * Verify Google id_token obtained on client-side (Google Identity).
     * Uses Google's tokeninfo endpoint.
     * Returns token payload as Map if valid; throws RuntimeException on invalid.
     */
    public Map<String, Object> verifyGoogleIdToken(String idToken) {
        // call tokeninfo
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        ResponseEntity<Map> resp = rest.getForEntity(url, Map.class);

        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Invalid Google id_token");
        }

        Map<String, Object> payload = resp.getBody();

        // Validate audience (aud)
        Object aud = payload.get("aud");
        if (aud == null || !googleClientId.equals(aud.toString())) {
            throw new RuntimeException("Invalid Google token audience");
        }

        // Validate email_verified
        Object emailVerified = payload.get("email_verified");
        if (emailVerified != null && !"true".equals(emailVerified.toString())) {
            throw new RuntimeException("Google account email not verified");
        }

        // Optionally validate expiry: tokeninfo returns "exp" (seconds since epoch) or "exp" may be absent.
        // You can check "exp" here if needed.

        // payload contains fields: iss, azp, aud, sub, email, email_verified, name, picture, given_name, family_name, iat, exp, ...
        return payload;
    }

    @Transactional
    public AuthResponseDTO login(SocialLoginRequestDTO req) {
        log.debug("Processing social login request: {}", req);
        try {
            final String provider = req.getProvider() == null ? "" 
                : req.getProvider().trim().toUpperCase(Locale.ROOT);
            final String token = req.getAccessToken();

            log.debug("Validating {} token", provider);
            
            String externalId; // sub/id từ provider
            String email = null;
            String name = null;
            String avatar = null;

            switch (provider) {
                case "GOOGLE" -> {
                    GoogleIdToken.Payload p = googleVerifier.verify(token);
                    if (p == null) {
                        throw new IllegalArgumentException("Google token is invalid or audience mismatch");
                    }
                    externalId = (String) p.get("sub");
                    email = (String) p.get("email");
                    name = (String) p.get("name");
                    avatar = (String) p.get("picture");
                    log.debug("[GOOGLE] sub={}, email={}, name={}", externalId, email, name);
                }
                case "FACEBOOK" -> {
                    Map<String, Object> me = fbVerifier.verify(token);
                    if (me == null) {
                        throw new IllegalArgumentException("Facebook token is invalid");
                    }
                    externalId = String.valueOf(me.get("id"));
                    Object e = me.get("email");
                    if (e != null)
                        email = e.toString();
                    Object n = me.get("name");
                    if (n != null)
                        name = n.toString();

                    // picture: { data: { url: ... } }
                    Object picture = me.get("picture");
                    if (picture instanceof Map<?, ?> pic) {
                        Object data = ((Map<?, ?>) picture).get("data");
                        if (data instanceof Map<?, ?> d) {
                            Object url = d.get("url");
                            if (url != null)
                                avatar = url.toString();
                        }
                    }

                    log.debug("[FACEBOOK] id={}, email={}, name={}", externalId, email, name);
                }
                default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
            }

            log.debug("Finding user by email: {}", email);
            User user = (email != null) ? userRepo.findByEmail(email).orElse(null) : null;

            if (user == null) {
                log.debug("User not found, creating new user with email: {}", email);
                Role defaultRole = roleRepo.findByRoleName("MEMBER");
                if (defaultRole == null) {
                    defaultRole = roleRepo.findByRoleName("Member");
                }
                if (defaultRole == null) {
                    throw new IllegalStateException("Required role 'MEMBER' or 'Member' not found in database");
                }
                log.debug("Found default role: {}", defaultRole.getRoleName());

                user = new User();
                user.setRole(defaultRole);
                user.setEmail(email != null ? email : 
                    (provider.toLowerCase(Locale.ROOT) + "_" + UUID.randomUUID() + "@example.com"));
                user.setUsername(generateUniqueUsername(name != null ? name : 
                    provider.toLowerCase(Locale.ROOT) + "_user"));
                user.setPassword("");
                user.setStatus("Active"); 
                user.setCreatedAt(new Date());

                user = userRepo.save(user);
                log.info("Created new social user: id={}, email={}, provider={}", 
                    user.getUserID(), user.getEmail(), provider);
            }

            // Khi tạo JWT token, đảm bảo username được encode đúng
            String jwt = jwtProvider.createToken(
                user.getUserID(),
                new String(user.getEmail().getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8),
                user.getRole().getRoleName()
            );

            // Khi tạo response
            return new AuthResponseDTO(
                jwt,
                user.getUserID(),
                new String(user.getUsername().getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8),
                user.getEmail(),
                user.getRole().getRoleName()
            );

        } catch (Exception ex) {
            log.error("Social login failed: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, 
                "Social login failed: " + ex.getMessage(),
                ex
            );
        }
    }
}
