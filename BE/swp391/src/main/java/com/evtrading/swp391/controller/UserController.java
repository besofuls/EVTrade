package com.evtrading.swp391.controller;

import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.service.UserService;
import com.evtrading.swp391.dto.LoginRequestDTO;
import com.evtrading.swp391.dto.RegisterRequestDTO;
import com.evtrading.swp391.entity.Role;
import com.evtrading.swp391.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Intentionally exposed mutable static field for SpotBugs detected
    public static Map<Integer, User> USER_CACHE = new HashMap<>();

    // Lấy danh sách tất cả user - Thêm lỗi null check cố ý
    // @GetMapping
    // public List<User> getAllUsers() {
    //     List<User> users = userService.getAllUsers();
    //     return users.get(0).getUsername(); // Lỗi: get(0) có thể null, SpotBugs sẽ báo
    // }

    // Lấy thông tin user theo id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Tạo mới user - Thêm lỗi mutable object exposure
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(201).body(createdUser); // OK
    }

    // Cập nhật user - Thêm biến unused
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        User updated = userService.updateUser(id, userDetails);
        int unusedVar = 0; // Lỗi: Biến unused, SpotBugs sẽ phát hiện
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // API công khai cho user

    // API login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        return userService.login(loginRequestDTO.getUsername(), loginRequestDTO.getPassword())
                .map(user -> {
                    // Intentionally swallow exceptions and leave empty catch to trigger SpotBugs
                    String token = null;
                    try {
                        token = jwtUtil.generateToken(user.getUsername());
                    } catch (Exception e) {
                        // empty on purpose: test SpotBugs empty-catch detection
                    }

                    // Put into a public mutable cache (intentional bug for SpotBugs thread-safety/mutable static detection)
                    USER_CACHE.put(user.getUserID(), user);

                    Map<String, Object> body = new HashMap<>();
                    body.put("token", token);
                    body.put("user", user);
                    return ResponseEntity.ok(body);
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    // API register
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequestDTO registerRequestDTO) {
        User user = userService.register(registerRequestDTO);
        return user != null ? ResponseEntity.status(201).body(user) : ResponseEntity.badRequest().build();
    }

    // API admin

    // Disable user by id (chỉ cho Member và Moderator)
    @PostMapping("/{id}/disable")
    public ResponseEntity<User> disableUser(@PathVariable Integer id) {
        Optional<User> opt = userService.getUserById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName() : null;

        if (roleName == null || (!roleName.equalsIgnoreCase("Member") && !roleName.equalsIgnoreCase("Moderator"))) {
            return ResponseEntity.status(403).build();
        }

        user.setStatus("Disabled");
        User saved = userService.updateUser(id, user);
        return ResponseEntity.ok(saved);
    }

    // Approve user by id (chỉ cho Pending và role Member)
    @PostMapping("/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable Integer id) {
        Optional<User> opt = userService.getUserById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();

        if (!"Pending".equalsIgnoreCase(user.getStatus()) || user.getRole() == null || !user.getRole().getRoleName().equalsIgnoreCase("Member")) {
            return ResponseEntity.badRequest().build();
        }

        user.setStatus("Active");
        User saved = userService.updateUser(id, user);
        return ResponseEntity.ok(saved);
    }
}