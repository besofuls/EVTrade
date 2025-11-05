package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Service trung gian giữa Spring Security và dữ liệu người dùng
 * 
 * Lớp này có nhiệm vụ quan trọng trong hệ thống xác thực:
 * - Implement UserDetailsService của Spring Security
 * - Tìm kiếm thông tin người dùng trong database
 * - Chuyển đổi User của ứng dụng thành UserDetails của Spring Security
 * - Cung cấp thông tin quyền hạn (authorities) cho người dùng
 * 
 * Luồng sử dụng:
 * 1. Khi người dùng đăng nhập, AuthenticationManager gọi service này
 * 2. Service này tìm User trong database
 * 3. Chuyển đổi User thành UserDetails để Spring Security có thể xử lý xác thực
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    /**
     * Repository để truy vấn thông tin người dùng từ database
     */
    @Autowired
    UserRepository userRepository;

    /**
     * Phương thức bắt buộc của interface UserDetailsService
     * Tìm kiếm người dùng dựa trên username và chuyển đổi thành UserDetails
     * 
     * @param username Tên đăng nhập cần tìm
     * @return UserDetails chứa thông tin xác thực và quyền hạn của người dùng
     * @throws UsernameNotFoundException nếu không tìm thấy người dùng
     */
    @Override
    @Transactional // Đảm bảo toàn vẹn giao dịch khi truy vấn database
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm kiếm người dùng trong database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        // Tạo tập hợp quyền hạn (authorities) cho người dùng
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (user.getRole() != null) {
            // Spring Security yêu cầu role phải có tiền tố "ROLE_"
            // Ví dụ: role "ADMIN" trong database sẽ trở thành "ROLE_ADMIN" trong Spring Security
            // Điều này cho phép sử dụng annotation như @PreAuthorize("hasRole('ADMIN')")
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName().toUpperCase()));
        }

        // Tạo và trả về đối tượng UserDetails của Spring Security
        // Đây là đối tượng mà Spring Security sẽ sử dụng trong quá trình xác thực
        // Chứa 3 thông tin quan trọng: username, password, authorities
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),  // Username để xác thực
                user.getPassword(),  // Password để xác thực (Spring sẽ so sánh với input)
                authorities);        // Danh sách quyền hạn của người dùng
    }
}