package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Complaint;
import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ComplaintRepository;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository, ListingRepository listingRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional
    public Optional<Complaint> createComplaint(Integer userId, Integer listingId, String content) {
        Optional<User> u = userRepository.findById(userId);
        Optional<Listing> l = listingRepository.findById(listingId);
        if (u.isEmpty() || l.isEmpty()) return Optional.empty();

        Complaint c = new Complaint();
        c.setUser(u.get());
        c.setListing(l.get());
        c.setContent(content);
        c.setStatus("Pending");
        c.setCreatedAt(new Date());
        Complaint saved = complaintRepository.save(c);
        return Optional.of(saved);
    }

    /*
     * Ghi chú:
     * - createComplaint: tạo complaint mới với status = "Pending".
     * - listByStatus: nếu status null hoặc rỗng thì trả về tất cả complaint; thường admin sẽ gọi
     *   với status=Pending để lấy các complaint chờ xử lý.
     * - resolveComplaint: cập nhật trạng thái (ví dụ: Resolved, Rejected) và set resolvedAt.
     *
     * Quyền truy cập:
     * - createComplaint: được phép cho tất cả người dùng đã đăng nhập (caller truyền userId từ token).
     * - listByStatus / resolveComplaint: nên giới hạn cho role Admin/Moderator ở level controller (ví dụ @PreAuthorize).
     */

    public List<Complaint> listByStatus(String status) {
        if (status == null || status.isBlank()) return complaintRepository.findAll();
        return complaintRepository.findByStatus(status);
    }

    @Transactional
    public Optional<Complaint> resolveComplaint(Integer complaintId, String newStatus) {
        Optional<Complaint> opt = complaintRepository.findById(complaintId);
        if (opt.isEmpty()) return Optional.empty();
        Complaint c = opt.get();
        c.setStatus(newStatus);
        c.setResolvedAt(new Date());
        Complaint saved = complaintRepository.save(c);
        return Optional.of(saved);
    }
}
