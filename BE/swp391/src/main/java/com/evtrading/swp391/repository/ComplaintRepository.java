package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    // Tìm khiếu nại theo trạng thái (ví dụ: "Pending", "Resolved", "Rejected")
    List<Complaint> findByStatus(String status);
    // Kiểm tra đã có complaint cho bài đăng này chưa
    boolean existsByListingListingID(Integer listingId);
}
