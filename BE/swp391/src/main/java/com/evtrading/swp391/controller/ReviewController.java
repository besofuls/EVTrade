package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.ReviewCreateDTO;
import com.evtrading.swp391.entity.Review;
import com.evtrading.swp391.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // POST /api/reviews
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewCreateDTO dto) {
        var opt = reviewService.createReview(dto.getUserId(), dto.getListingId(), dto.getRating(), dto.getComment());
        if (opt.isPresent()) return ResponseEntity.ok(opt.get());
        return ResponseEntity.badRequest().body("User not found, listing not found, or user hasn't purchased this listing (or order not completed)");
    }

    // GET /api/reviews/listing/{listingId}
    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<Review>> listByListing(@PathVariable Integer listingId) {
        List<Review> list = reviewService.getReviewsForListing(listingId);
        return ResponseEntity.ok(list);
    }

}
