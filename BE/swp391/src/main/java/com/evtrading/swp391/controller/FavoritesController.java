package com.evtrading.swp391.controller;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.service.FavoritesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {
    private final FavoritesService favoritesService;

    public FavoritesController(FavoritesService favoritesService) {
        this.favoritesService = favoritesService;
    }

    /**
     * Thêm một bài đăng (listing) vào danh sách yêu thích của người dùng đang đăng nhập.
     *
     * Luồng & giả định:
     * - Endpoint này yêu cầu request đã được xác thực. Chúng ta lấy danh tính gọi
     *   từ đối tượng Principal do Spring Security cung cấp. Principal ở đây được giả sử
     *   chứa `username` (không phải userID số). Service sẽ chuyển `username` -> entity User.
     * - Endpoint này KHÔNG tự tạo authentication; client phải đã xác thực trước đó
     *   (ví dụ: cung cấp Bearer token hợp lệ hoặc cookie session). Nếu Principal = null
     *   thì trả về 401 Unauthorized.
     * - Controller trả JSON đơn giản với trường `favorited` hoặc thông báo lỗi.
     *
     * Tham số đầu vào:
     * - listingId: id của listing muốn thêm vào favorite.
     * - Principal: do Spring Security cung cấp (phải khác null khi đã auth).
     *
     * Hành vi / mã trả về:
     * - 200 OK + {"favorited":true} nếu thêm thành công.
     * - 400 Bad Request nếu không thể thêm (ví dụ đã tồn tại hoặc listing/user không tìm thấy).
     * - 401 Unauthorized nếu chưa xác thực.
     * - 500 Internal Server Error nếu có lỗi bất ngờ.
     */
    @PostMapping("/listings/{listingId}")
    public ResponseEntity<?> addFavorite(@PathVariable Integer listingId, Principal principal) {
        if (principal == null) {
            // Caller is not authenticated
            return ResponseEntity.status(401).body("{\"error\":\"Unauthorized\"}");
        }
        try {
            String username = principal.getName();
            boolean added = favoritesService.addFavoriteListing(username, listingId);
            if (added) return ResponseEntity.ok().body("{\"favorited\":true}");
            // Generic failure: client can interpret false as "already favorited" or "not found"
            return ResponseEntity.status(400).body("{\"favorited\":false, \"error\":\"Could not add favorite (maybe already exists or listing/user not found)\"}");
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"Internal server error\"}");
        }
    }

    /**
     * Xóa một bài đăng khỏi danh sách yêu thích của người dùng đã xác thực.
     *
     * Ghi chú:
     * - Hành vi Principal giống như addFavorite. Nếu caller chưa xác thực, trả 401.
     * - Nếu favorite không tồn tại thì trả 404 (có thể dùng 204 cho idempotent delete,
     *   nhưng ở đây trả 404 để client biết rằng không có record nào bị xóa).
     */
    @DeleteMapping("/listings/{listingId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Integer listingId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("{\"error\":\"Unauthorized\"}");
        }
        try {
            String username = principal.getName();
            boolean removed = favoritesService.removeFavoriteListing(username, listingId);
            if (removed) return ResponseEntity.ok().body("{\"favorited\":false}");
            return ResponseEntity.status(404).body("{\"error\":\"Favorite not found\"}");
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"Internal server error\"}");
        }
    }

    /**
     * Lấy tất cả các listing mà người dùng đang xác thực đã thêm vào favorite.
     * - Trả 401 nếu chưa xác thực.
     * - Trả 200 và mảng Listing khi thành công.
     */
    @GetMapping("/listings")
    public ResponseEntity<List<Listing>> myFavorites(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            String username = principal.getName();
            List<Listing> listings = favoritesService.getFavoriteListings(username);
            return ResponseEntity.ok(listings);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
