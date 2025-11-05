package com.evtrading.swp391.security;

import com.evtrading.swp391.config.SecurityPaths;
import com.evtrading.swp391.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.lang.NonNull;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter để kiểm tra và xác thực JWT trong mỗi request gửi đến server
 * 
 * Kế thừa từ OncePerRequestFilter để đảm bảo chỉ chạy một lần cho mỗi request
 * Đây là filter đầu tiên trong chuỗi filter của Spring Security
 */
public class JwtAuthFilter extends OncePerRequestFilter {
    /**
     * Tiện ích để xử lý JWT (tạo, xác thực, trích xuất thông tin)
     */
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Service để tải thông tin người dùng từ database dựa vào username
     */
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Logger để ghi lại các lỗi xảy ra trong quá trình xác thực
     */
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    /**
     * Phương thức chính xử lý mỗi request HTTP
     * 
     * Luồng xử lý:
     * 1. Trích xuất JWT từ header Authorization
     * 2. Nếu có JWT và hợp lệ:
     *    - Lấy username từ JWT
     *    - Tải thông tin chi tiết về người dùng từ database
     *    - Tạo đối tượng xác thực (Authentication) với thông tin người dùng và quyền hạn
     *    - Lưu thông tin xác thực vào SecurityContext để các filter tiếp theo sử dụng
     * 3. Gọi filter tiếp theo trong chuỗi
     * 
     * @param request  HTTP request từ client
     * @param response HTTP response sẽ trả về client
     * @param filterChain chuỗi filter còn lại cần được xử lý
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Trích xuất JWT từ header Authorization
            String jwt = parseJwt(request);
            
            // Nếu JWT tồn tại và hợp lệ
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // Lấy username từ JWT
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // Tải thông tin người dùng từ database dựa vào username
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Tạo đối tượng xác thực (không cần mật khẩu vì JWT đã xác thực rồi)
                // Tham số thứ 3 là danh sách quyền (authorities) của người dùng
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,  // Thông tin người dùng
                                null,         // Không cần mật khẩu
                                userDetails.getAuthorities());  // Quyền của người dùng
                
                // Thêm các chi tiết về request hiện tại (IP, session...)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Lưu thông tin xác thực vào SecurityContext
                // Các filter và controller phía sau có thể truy cập thông tin này
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Ghi log nếu có lỗi xảy ra trong quá trình xác thực
            logger.error("Không thể xác thực người dùng: {}", e.getMessage());
        }

        // Gọi filter tiếp theo trong chuỗi
        // Nếu xác thực thành công, các filter tiếp theo sẽ thấy SecurityContext đã được thiết lập
        // Nếu không, các filter tiếp theo sẽ xử lý request như là chưa xác thực
        filterChain.doFilter(request, response);
    }

    /**
     * Trích xuất JWT token từ header "Authorization" trong request
     * 
     * Format chuẩn: Authorization: Bearer [token]
     * 
     * @param request HTTP request từ client
     * @return JWT token nếu tìm thấy, null nếu không tìm thấy
     */
    private String parseJwt(HttpServletRequest request) {
        // Lấy giá trị của header Authorization
        String headerAuth = request.getHeader("Authorization");

        // Kiểm tra xem header có tồn tại và đúng định dạng "Bearer [token]" không
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Trả về phần token (bỏ "Bearer " ở đầu)
            return headerAuth.substring(7);
        }

        // Không tìm thấy token hợp lệ
        return null;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        // Log để debug
        System.out.println("JWT Filter checking: " + path);

        return SecurityPaths.isPublicPath(path);
    }
}
