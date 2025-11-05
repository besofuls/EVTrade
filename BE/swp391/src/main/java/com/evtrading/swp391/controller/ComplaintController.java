package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.ComplaintCreateDTO;
import com.evtrading.swp391.dto.ComplaintResolveDTO;
import com.evtrading.swp391.entity.Complaint;
import com.evtrading.swp391.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // POST /api/complaints
    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody ComplaintCreateDTO dto) {
        var opt = complaintService.createComplaint(dto.getUserId(), dto.getListingId(), dto.getContent());
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.badRequest().body("User or Listing not found");
    }

    // GET /api/complaints?status=Pending
    @GetMapping
    public ResponseEntity<List<Complaint>> listComplaints(@RequestParam(required = false) String status) {
        List<Complaint> list = complaintService.listByStatus(status);
        return ResponseEntity.ok(list);
    }

    // PUT /api/complaints/{id}/resolve
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Integer id, @RequestBody ComplaintResolveDTO dto) {
        var opt = complaintService.resolveComplaint(id, dto.getStatus());
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.notFound().build();
    }

    /*
     * Ghi chú endpoint:
     * - createComplaint: public cho tất cả người dùng đăng nhập; frontend nên truyền userId từ token
     *   hoặc lấy userId phía server từ Principal để tránh client giả mạo userId.
     * - listComplaints: admin/moderator dùng dashboard để lọc theo status; triển khai @PreAuthorize ở đây nếu cần.
     * - resolveComplaint: chỉ admin/moderator mới có quyền cập nhật; nên thêm @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
     *   để bảo vệ endpoint này.
     */

}
