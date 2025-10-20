package com.evtrading.swp391.config;

import com.evtrading.swp391.security.JwtAuthFilter;
import com.evtrading.swp391.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

/**
 * Cấu hình chính của Spring Security cho ứng dụng
 * Định nghĩa cách xác thực người dùng, phân quyền, và bảo mật các endpoints
 */
@Configuration // Đánh dấu là lớp cấu hình cho Spring
@EnableMethodSecurity // Cho phép sử dụng các annotation @PreAuthorize trên các phương thức controller
public class SecurityConfig {
    
    /**
     * Service tùy chỉnh để tải thông tin người dùng từ database
     * Implement UserDetailsService của Spring Security
     */
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    /**
     * Tạo bộ lọc JWT để xác thực token trong mỗi request
     * Bộ lọc này sẽ chạy trước các bộ lọc xác thực khác
     * 
     * Cách hoạt động:
     * 1. Đọc JWT từ header "Authorization" (Bearer token)
     * 2. Kiểm tra tính hợp lệ của token
     * 3. Tải thông tin người dùng từ token
     * 4. Đặt thông tin xác thực vào SecurityContextHolder
     */
    @Bean
    public JwtAuthFilter authenticationJwtTokenFilter() {
        return new JwtAuthFilter();
    }

    /**
     * Cấu hình AuthenticationProvider - thành phần chính xử lý xác thực
     * 
     * Cách hoạt động:
     * 1. Nhận username/password từ người dùng
     * 2. Dùng UserDetailsService để load thông tin người dùng từ database
     * 3. Dùng PasswordEncoder để so sánh mật khẩu
     * 4. Trả về đối tượng Authentication nếu xác thực thành công
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Chỉ định service để tải thông tin user
        authProvider.setUserDetailsService(userDetailsService);
        // Chỉ định cách mã hóa/so sánh mật khẩu
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AuthenticationManager - quản lý quá trình xác thực
     * Được sử dụng trong AuthController để xác thực thông tin đăng nhập
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Định nghĩa cách mã hóa mật khẩu
     * 
     * Hiện tại: Sử dụng NoOpPasswordEncoder (không mã hóa) - CHỈ DÙNG CHO DEVELOPMENT
     * Khuyến nghị: BCryptPasswordEncoder cho production
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Tạm thời dùng NoOpPasswordEncoder để giữ cơ chế mật khẩu plaintext
        // CẢNH BÁO: Đây là cấu hình không an toàn, chỉ nên dùng trong development
        return NoOpPasswordEncoder.getInstance();

        /*
        // Đây là cách đúng để mã hóa mật khẩu cho môi trường production
        // BCrypt tự động thêm salt khác nhau cho mỗi mật khẩu
        // và sử dụng hashing mạnh mẽ để bảo vệ mật khẩu
        return new BCryptPasswordEncoder();
        */
    }

    /**
     * Cấu hình bảo mật chính cho ứng dụng
     * Định nghĩa các quy tắc truy cập endpoints, filter chain, xác thực...
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        // Cấu hình session management
        http.sessionManagement(session -> 
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Vô hiệu hóa CSRF và cấu hình CORS
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(Customizer.withDefaults());
        
        
        // Cấu hình authorization
        http.authorizeHttpRequests(auth -> 
            auth
                // Cho phép truy cập không cần xác thực
                .requestMatchers(SecurityPaths.publicEndpoints()).permitAll()
                // Các endpoint khác yêu cầu xác thực
                .anyRequest().authenticated()
        );
        
        // Đảm bảo JWT filter chỉ được áp dụng sau khi đã xác thực
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        
        
        return http.build();
    }
}
