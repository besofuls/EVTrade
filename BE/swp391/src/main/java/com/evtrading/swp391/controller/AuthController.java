package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.AuthResponseDTO;
import com.evtrading.swp391.dto.GoogleCodeDTO;
import com.evtrading.swp391.dto.GoogleTokenResponse;
import com.evtrading.swp391.dto.LoginRequestDTO;
import com.evtrading.swp391.dto.RegisterRequestDTO;
import com.evtrading.swp391.dto.SocialLoginRequestDTO;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.security.JwtProvider;
import com.evtrading.swp391.service.SocialAuthService;
import com.evtrading.swp391.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.util.Value;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * Controller xử lý các yêu cầu xác thực như đăng nhập và đăng ký
 * Endpoint gốc: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SocialAuthService socialAuthService;

    /**
     * AuthenticationManager là thành phần chính của Spring Security
     * Dùng để xác thực thông tin đăng nhập (username, password)
     */
    @Autowired
    AuthenticationManager authenticationManager;

    /**
     * UserService chứa logic xử lý đăng ký người dùng
     */
    @Autowired
    UserService userService;

    /**
     * JwtProvider cung cấp các phương thức để tạo và xác thực JWT token
     */
    @Autowired
    JwtProvider jwtProvider;

    @Autowired
    UserRepository userRepository;

    AuthController(SocialAuthService socialAuthService) {
        this.socialAuthService = socialAuthService;
    }

    /**
     * API đăng nhập: Xác thực người dùng và trả về JWT token
     * 
     * Luồng xử lý:
     * 1. Nhận request chứa username và password
     * 2. Sử dụng AuthenticationManager để xác thực thông tin đăng nhập
     * - Bên trong, AuthenticationManager sẽ gọi UserDetailsService để load user từ
     * database
     * - So sánh password người dùng nhập với password trong database
     * 3. Nếu thông tin hợp lệ, tạo JWT token
     * 4. Trả về token cho client
     * 
     * @param loginRequest DTO chứa username và password
     * @return JWT token nếu đăng nhập thành công, lỗi nếu thất bại
     */
    @SecurityRequirements // Loại bỏ yêu cầu security trong Swagger UI
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // Log chi tiết thông tin đăng nhập
            System.out.println("Attempting login: " + loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            // Nếu không có exception, xác thực thành công
            System.out.println("Authentication successful for: " + loginRequest.getUsername());

            // Lưu context và tạo token
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Lấy thông tin chi tiết của người dùng
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // Tạo JWT bằng JwtProvider
            String jwt = jwtProvider.createToken(
                    user.getUserID(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().getRoleName()
            );

            AuthResponseDTO response = new AuthResponseDTO(
                    jwt,
                    user.getUserID(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().getRoleName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log chi tiết lỗi để debug
            System.err.println("Authentication error: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            // Trả về lỗi 401 thay vì 403
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    /**
     * API đăng ký: Tạo người dùng mới trong hệ thống
     * 
     * Luồng xử lý:
     * 1. Nhận request chứa thông tin đăng ký (username, email, password)
     * 2. Gọi UserService để xử lý đăng ký
     * - Kiểm tra username và email đã tồn tại chưa
     * - Tạo user mới với trạng thái "Pending" (chờ duyệt)
     * - Gán role mặc định là "Member"
     * 3. Trả về kết quả đăng ký
     * 
     * @param registerRequest DTO chứa thông tin đăng ký
     * @return Thông báo thành công hoặc lỗi
     */
    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerRequest) {
        // Gọi service để xử lý đăng ký
        User user = userService.register(registerRequest);

        // Kiểm tra kết quả
        if (user != null) {
            // Đăng ký thành công, trả về mã 201 (Created)
            return ResponseEntity.status(201).body("User registered successfully!");
        }

        // Đăng ký thất bại do username hoặc email đã tồn tại
        return ResponseEntity.badRequest().body("Error: Username or email is already taken!");
    }

    /**
     * API đăng xuất: Xử lý yêu cầu đăng xuất của người dùng
     * 
     * Trong hệ thống JWT, logout được xử lý chủ yếu ở phía client
     * API này chỉ trả về thông báo thành công, client sẽ xóa token lưu trữ
     * 
     * @return Thông báo đăng xuất thành công
     */
    @SecurityRequirements // Thêm annotation này
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok().body("Đăng xuất thành công!");
    }

    @SecurityRequirements
    @PostMapping("/social")
  public ResponseEntity<?> social(@RequestBody SocialLoginRequestDTO request) {
        var token = socialAuthService.login(request);
        return ResponseEntity.ok(token);
  }


 @Value("${spring.security.oauth2.client.registration.google.client-id}")
private String clientId;

@Value("${spring.security.oauth2.client.registration.google.client-secret}")
private String clientSecret;

// Đổi code lấy token từ Google
private GoogleTokenResponse exchangeCodeForTokens(String code) {
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

// Thêm endpoint mới cho server-side Google OAuth
@SecurityRequirements
@PostMapping("/google/code")
public ResponseEntity<?> googleServerSideLogin(@RequestBody GoogleCodeDTO dto) {
    try {
        String code = dto.getCode();

        // 1. Đổi code lấy token (gồm id_token)
        GoogleTokenResponse tokenResponse = exchangeCodeForTokens(code);

        // 2. Dùng GoogleAuthVerifier để verify id_token
        GoogleIdToken.Payload payload = socialAuthService.getGoogleVerifier().verify(tokenResponse.getId_token());
        if (payload == null) {
            throw new RuntimeException("Invalid ID token from Google");
        }

        // 3. Tái sử dụng logic xử lý user từ SocialAuthService
        var user = socialAuthService.processGoogleUser(payload);

        // 4. Tạo JWT như cũ
        String jwt = jwtProvider.createToken(
                user.getUserID(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getRoleName()
        );

        AuthResponseDTO response = new AuthResponseDTO(
            jwt,
            user.getUserID(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().getRoleName()
        );

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest()
            .body("Google login failed: " + e.getMessage());
    }
}
}
