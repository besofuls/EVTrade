package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.AuthResponseDTO;
import com.evtrading.swp391.dto.LoginRequestDTO;
import com.evtrading.swp391.dto.RegisterRequestDTO;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.security.JwtUtils;
import com.evtrading.swp391.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


/**
 * Controller xử lý các yêu cầu xác thực như đăng nhập và đăng ký
 * Endpoint gốc: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
     * JwtUtils cung cấp các phương thức để tạo và xác thực JWT token
     */
    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    /**
     * API đăng nhập: Xác thực người dùng và trả về JWT token
     * 
     * Luồng xử lý:
     * 1. Nhận request chứa username và password
     * 2. Sử dụng AuthenticationManager để xác thực thông tin đăng nhập
     *    - Bên trong, AuthenticationManager sẽ gọi UserDetailsService để load user từ database
     *    - So sánh password người dùng nhập với password trong database
     * 3. Nếu thông tin hợp lệ, tạo JWT token
     * 4. Trả về token cho client
     * 
     * @param loginRequest DTO chứa username và password
     * @return JWT token nếu đăng nhập thành công, lỗi nếu thất bại
     */
    @SecurityRequirements  // Loại bỏ yêu cầu security trong Swagger UI
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // Log chi tiết thông tin đăng nhập
            System.out.println("Attempting login: " + loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            // Nếu không có exception, xác thực thành công
            System.out.println("Authentication successful for: " + loginRequest.getUsername());
            
            // Lưu context và tạo token
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            // Lấy thông tin chi tiết của người dùng
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // Tạo response chứa token, thông tin người dùng và tokenType
            AuthResponseDTO response = new AuthResponseDTO(
                    jwt,
                    user.getUserID(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().getRoleName()
            );

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
     *    - Kiểm tra username và email đã tồn tại chưa
     *    - Tạo user mới với trạng thái "Pending" (chờ duyệt)
     *    - Gán role mặc định là "Member"
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
    @SecurityRequirements  // Thêm annotation này
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok().body("Đăng xuất thành công!");
    }
}
