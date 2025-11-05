package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.AuthResponseDTO;
import com.evtrading.swp391.dto.GoogleTokenResponse;
import com.evtrading.swp391.dto.SocialLoginRequestDTO;
import com.evtrading.swp391.entity.Role;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.RoleRepository;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.security.FacebookAuthVerifier;
import com.evtrading.swp391.security.GoogleAuthVerifier;
import com.evtrading.swp391.security.JwtProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.google.api.client.util.Value;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus; // Add this import for HttpStatus
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
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

    private String generateUniqueUsername(String base) {
        if (base == null || base.isBlank()) {
            base = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }

        String normalized = Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", ""); // bỏ dấu

        String candidate = normalized.trim()
                .replaceAll("[\\p{Space}]+", "_")
                .replaceAll("[^a-zA-Z0-9_-]", "")
                .toLowerCase(Locale.ROOT);

        if (candidate.length() < 3) {
            candidate = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }

        String unique = candidate;
        int i = 1;
        while (userRepo.findByUsername(unique).isPresent()) {
            unique = candidate + "_" + i++;
        }
        return unique;
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
                user.getUsername(),
                user.getEmail(),
                user.getRole().getRoleName()
            );

            return new AuthResponseDTO(
                jwt,
                user.getUserID(),
                user.getUsername(),
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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
private String clientId;

@Value("${spring.security.oauth2.client.registration.google.client-secret}")
private String clientSecret;

public GoogleTokenResponse exchangeCodeForTokens(String code) {
    RestTemplate rest = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
    map.add("code", code);
    map.add("client_id", clientId);
    map.add("client_secret", clientSecret);
    map.add("redirect_uri", "http://localhost:8080/api/auth/google/callback");
    map.add("grant_type", "authorization_code");

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

    ResponseEntity<GoogleTokenResponse> response = rest.postForEntity(
        "https://oauth2.googleapis.com/token",
        request,
        GoogleTokenResponse.class
    );

    return response.getBody();
}

public GoogleAuthVerifier getGoogleVerifier() {
    return googleVerifier;
}

public User processGoogleUser(GoogleIdToken.Payload payload) {
    String email = payload.getEmail();
    String googleId = payload.getSubject();
    String name = (String) payload.get("name");

    User user = userRepo.findByEmail(email).orElse(null);
    if (user == null) {
        user = new User();
        user.setEmail(email);
        user.setUsername(generateUniqueUsername(name));
        user.setRole(roleRepo.findByRoleName("MEMBER"));
        user.setStatus("Active");
        user.setPassword("");
        user = userRepo.save(user);
    }
    // Nếu muốn lưu SocialAccount, thêm logic ở đây

    return user;
}
}
