package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.SellerFeedbackDTO;
import com.evtrading.swp391.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
public class SellerFeedbackController {
    private final ReviewService reviewService;

    public SellerFeedbackController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /api/sellers/{sellerId}/feedback
    @GetMapping("/{sellerId}/feedback")
    public ResponseEntity<SellerFeedbackDTO> getSellerFeedback(@PathVariable Integer sellerId) {
        SellerFeedbackDTO dto = reviewService.getSellerFeedback(sellerId);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }
}
