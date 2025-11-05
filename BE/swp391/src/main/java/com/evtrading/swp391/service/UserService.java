package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.evtrading.swp391.repository.RoleRepository roleRepository;

    /*
     * // Bỏ comment dòng này khi bạn muốn dùng BCrypt
     * 
     * @Autowired
     * private PasswordEncoder passwordEncoder;
     */

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setRole(userDetails.getRole());
            user.setStatus(userDetails.getStatus());
            return userRepository.save(user);
        }).orElse(null);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User register(com.evtrading.swp391.dto.RegisterRequestDTO registerRequestDTO) {
        if (userRepository.findByUsername(registerRequestDTO.getUsername()).isPresent() ||
                userRepository.findByEmail(registerRequestDTO.getEmail()).isPresent()) {
            return null; // Username hoặc email đã tồn tại
        }
        User user = new User();
        user.setUsername(registerRequestDTO.getUsername());
        user.setEmail(registerRequestDTO.getEmail());

        // Tạm thời vẫn dùng plaintext
        user.setPassword(registerRequestDTO.getPassword());

        /*
         * // Khi sẵn sàng, hãy dùng code này thay cho dòng trên
         * user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
         */

        // New users must be approved by an admin before they become active
        user.setStatus("Active");
        user.setCreatedAt(new java.util.Date());
        // Role mặc định là "Member"
        com.evtrading.swp391.entity.Role role = roleRepository.findByRoleName("Member");
        if (role == null) {
            // Or throw an exception, depending on how you want to handle this case
            return null;
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    public User disableUser(Integer id) {
        Optional<User> opt = getUserById(id);
        if (opt.isEmpty())
            return null;
        User user = opt.get();
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName() : null;
        if (roleName == null)
            return null;
        if (!roleName.equalsIgnoreCase("Member") && !roleName.equalsIgnoreCase("Moderator"))
            return null;
        user.setStatus("Disabled");
        return createUser(user);
    }

    public User enableUser(Integer id) {
        Optional<User> opt = getUserById(id);
        if (opt.isEmpty())
            return null;
        User user = opt.get();
        if (!"Disabled".equalsIgnoreCase(user.getStatus()))
            return null;
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName() : null;
        if (roleName == null)
            return null;
        if (!roleName.equalsIgnoreCase("Member"))
            return null;
        user.setStatus("Active");
        return createUser(user);
    }

}