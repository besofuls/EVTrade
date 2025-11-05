package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.ProfileDTO;
import com.evtrading.swp391.entity.Profile;
import com.evtrading.swp391.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API quản lý hồ sơ (Profile) người dùng.
 * Lưu ý quan trọng cho FE:
 *  - User mới đăng ký sẽ CHƯA có profile trong DB.
 *  - Lần đầu người dùng cập nhật (PUT {@link #updateProfile}) sẽ tự tạo profile mới.
 *  - Cập nhật dùng cơ chế partial update: chỉ field nào gửi (non-null & không rỗng) mới ghi đè.
 *
 * Endpoints:
 *  GET /api/profiles/{userId}
 *    200: trả về profile nếu đã tồn tại
 *    404: chưa có profile (FE nên hiển thị form trống)
 *
 * Gợi ý xử lý phía FE:
 *  1. Mở trang hồ sơ -> gọi GET.
 *     - Nếu 200: bind data vào form
 *     - Nếu 404: form rỗng, hiển thị "Chưa có hồ sơ, hãy cập nhật".
 *  2. Người dùng sửa và bấm Lưu -> gửi PUT chỉ với các field đã nhập.
 *  3. Sau khi 200: dùng response để đồng bộ lại state cục bộ.
 */

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    /**
     * Lấy profile theo userId.
     * @param userId ID user.
     * @return 200 nếu có, 404 nếu chưa tạo profile.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Profile> getProfileByUserId(@PathVariable Integer userId) {
        return profileService.getProfileByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Tạo mới (nếu chưa có) hoặc cập nhật hồ sơ người dùng.
     * Chỉ các field không null & không blank trong body được áp dụng.
     * @param userId ID user cần cập nhật.
     * @param profileDTO dữ liệu cập nhật.
     * @return 200 nếu thành công, 404 nếu user không tồn tại.
     */

//asdsdssss

/** PUT /api/profiles/{userId}
 *    Body (ví dụ - chỉ cần gửi field cần thay đổi):
 *      {
 *        "fullName": "Nguyen Van A",
 *        "phone": "0901234567",
 *        "address": "123 Le Loi"
 *      }
 *    200: trả về profile đã tạo/cập nhật
 *    404: userId không tồn tại */
    @PutMapping("/{userId}")
    public ResponseEntity<Profile> updateProfile(@PathVariable Integer userId, @RequestBody ProfileDTO profileDTO) {
        Profile updatedProfile = profileService.updateProfile(userId, profileDTO);
        if (updatedProfile != null) {
            return ResponseEntity.ok(updatedProfile);
        }
        return ResponseEntity.notFound().build();
    }
}
