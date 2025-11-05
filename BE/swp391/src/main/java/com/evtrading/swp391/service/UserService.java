package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.evtrading.swp391.repository.RoleRepository roleRepository;

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

    public Optional<User> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password));
    }

    // New: login and generate token subject (username)
    public Optional<String> loginWithToken(String username, String password, com.evtrading.swp391.security.JwtUtil jwtUtil) {
        return login(username, password).map(user -> jwtUtil.generateToken(user.getUsername()));
    }

    public User register(com.evtrading.swp391.dto.RegisterRequestDTO registerRequestDTO) {
        if (userRepository.findByUsername(registerRequestDTO.getUsername()).isPresent() ||
                userRepository.findByEmail(registerRequestDTO.getEmail()).isPresent()) {
            return null; // Username hoặc email đã tồn tại
        }
        User user = new User();
        user.setUsername(registerRequestDTO.getUsername());
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(registerRequestDTO.getPassword());
        // New users must be approved by an admin before they become active
        user.setStatus("Pending");
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
}