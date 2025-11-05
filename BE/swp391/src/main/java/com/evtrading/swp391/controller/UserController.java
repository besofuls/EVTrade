package com.evtrading.swp391.controller;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.service.UserService;
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
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
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
        Optional<User> opt = userService.getUserById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName() : null;
        if (roleName == null) {
            return ResponseEntity.status(403).build();
            //role null trả về 403 Forbidden
        }
        // Only allow disabling users with role Member or Moderator
        if (!roleName.equalsIgnoreCase("Member") && !roleName.equalsIgnoreCase("Moderator")) {
            return ResponseEntity.status(403).build();
            //role khác Member và Moderator trả về 403 Forbidden
        }
        user.setStatus("Disabled");
        User saved = userService.createUser(user);
        return ResponseEntity.ok(saved);
    }

    // Approve user by id (only if user is Pending and role is Member) 
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> approveUser(@PathVariable Integer id) {
        Optional<User> opt = userService.getUserById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        if (!"Pending".equalsIgnoreCase(user.getStatus())) {
            // Can't approve a user that's not pending
            return ResponseEntity.badRequest().build();
        }
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName() : null;
        if (roleName == null) {
            return ResponseEntity.status(403).build();
            //role null trả về 403 Forbidden
        }
        if (!roleName.equalsIgnoreCase("Member") ) {
            return ResponseEntity.status(403).build();
            //role khác Member trả về 403 Forbidden
        }
        user.setStatus("Active");
        User saved = userService.createUser(user);
        return ResponseEntity.ok(saved);
    }

}