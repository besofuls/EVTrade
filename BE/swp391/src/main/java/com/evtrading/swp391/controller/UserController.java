package com.evtrading.swp391.controller;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.evtrading.swp391.entity.Role;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    // Lấy danh sách tất cả user
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers()
        .stream()
        .filter(u -> u.getRole() != null && !"Admin".equalsIgnoreCase(u.getRole().getRoleName()))
        .toList();
    }

    // Lấy thông tin user theo id
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or principal.username == @userRepository.findById(#id).get().username")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Tạo mới user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Cập nhật user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        User updated = userService.updateUser(id, userDetails);
        if (updated != null)
            return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    // Xóa user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    ///////////////////////////////////////////////////////////////////////////////////

    //admin api
    // Disable user by id (chỉ các member và moderator)
    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> disableUser(@PathVariable Integer id) {
        User result = userService.disableUser(id);
        if (result == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(result);
    }

    // Enable user by id (only if user is Pending and role is Member) 
    @PostMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> enableUser(@PathVariable Integer id) {
        User result = userService.enableUser(id);
        if (result == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(result);
    }

}