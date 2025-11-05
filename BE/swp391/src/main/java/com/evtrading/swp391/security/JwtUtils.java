package com.evtrading.swp391.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Tiện ích xử lý JWT (JSON Web Token)
 * 
 * Lớp này cung cấp các phương thức để:
 * - Tạo JWT mới khi người dùng đăng nhập thành công
 * - Trích xuất thông tin (như username) từ JWT
 * - Xác thực tính hợp lệ của JWT
 * 
 * JWT là một chuỗi được mã hóa gồm 3 phần: header.payload.signature
 * - Header: Chứa thông tin về thuật toán mã hóa và loại token
 * - Payload: Chứa các thông tin (claims) như username, thời gian hết hạn
 * - Signature: Chữ ký để xác thực token không bị sửa đổi
 */
@Component
public class JwtUtils {
    /**
     * Logger để ghi lại các sự kiện/lỗi liên quan đến xử lý JWT
     */
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    /**
     * Khóa bí mật để ký và xác thực JWT
     * 
     * Giá trị này được cấu hình trong application.properties
     * Đây là một khóa bí mật quan trọng, KHÔNG ĐƯỢC chia sẻ hoặc để lộ
     * Nên sử dụng một chuỗi dài, ngẫu nhiên và phức tạp
     */
    @Value("${app.jwtSecret}")
    private String jwtSecret;

    /**
     * Thời gian hiệu lực của JWT tính bằng milli giây
     * 
     * Giá trị này được cấu hình trong application.properties
     * Ví dụ: 86400000ms = 24 giờ
     */
    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    /**
     * Tạo JWT token từ thông tin xác thực (Authentication)
     * 
     * Sử dụng sau khi xác thực thành công với username/password
     * 
     * @param authentication Đối tượng Authentication đã được xác thực
     * @return JWT token dưới dạng chuỗi
     */
    public String generateJwtToken(Authentication authentication) {
        // Lấy thông tin người dùng từ đối tượng Authentication
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        
        // Tạo token với username
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    /**
     * Tạo JWT token từ username
     * 
     * Phương thức này thiết lập các thông tin cơ bản của JWT:
     * - Subject: username của người dùng
     * - IssuedAt: thời điểm token được tạo
     * - Expiration: thời điểm token hết hạn
     * - Signature: chữ ký được tạo bằng thuật toán HS256
     * 
     * @param username Tên đăng nhập của người dùng
     * @return JWT token dưới dạng chuỗi
     */
    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                // Thiết lập username là subject của token
                .setSubject(username)
                // Thời điểm hiện tại khi token được tạo
                .setIssuedAt(new Date())
                // Thời điểm token hết hạn (thời điểm hiện tại + thời gian cấu hình)
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                // Ký token bằng khóa bí mật và thuật toán HS256
                .signWith(key(), SignatureAlgorithm.HS256)
                // Tạo chuỗi JWT hoàn chỉnh
                .compact();
    }

    /**
     * Tạo đối tượng Key từ khóa bí mật
     * 
     * Chuyển đổi chuỗi bí mật thành đối tượng Key để ký và xác thực JWT
     * 
     * @return Đối tượng Key được tạo từ khóa bí mật
     */
    private Key key() {
        // Chuyển đổi chuỗi jwtSecret thành đối tượng Key
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Trích xuất username từ JWT token
     * 
     * @param token JWT token cần trích xuất thông tin
     * @return Username của người dùng
     * @throws Exception Nếu token không hợp lệ hoặc hết hạn
     */
    public String getUserNameFromJwtToken(String token) {
        // Parse token, xác thực bằng khóa, và lấy thông tin subject (username)
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Kiểm tra tính hợp lệ của JWT token
     * 
     * Xác thực chữ ký và kiểm tra xem token có đúng định dạng, chưa hết hạn không
     * 
     * @param authToken JWT token cần xác thực
     * @return true nếu token hợp lệ, false nếu không
     */
    public boolean validateJwtToken(String authToken) {
        try {
            // Parse và xác thực token bằng khóa bí mật
            // Nếu thành công và không có exception, token hợp lệ
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            // Token không đúng định dạng JWT
            logger.error("Token JWT không hợp lệ: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            // Token đã hết hạn
            logger.error("Token JWT đã hết hạn: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            // Token sử dụng tính năng JWT không được hỗ trợ
            logger.error("Token JWT không được hỗ trợ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            // Claims rỗng hoặc token null
            logger.error("JWT claims string rỗng: {}", e.getMessage());
        }
        return false;
    }
}
