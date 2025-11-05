package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.Order;
import com.evtrading.swp391.entity.Review;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.OrderRepository;
import com.evtrading.swp391.repository.ReviewRepository;
import com.evtrading.swp391.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, ListingRepository listingRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Tạo review mới nếu user thực sự mua listing này (tìm trong OrderItem).
     * Trả về Optional.empty() nếu user hoặc listing không tồn tại, hoặc user chưa mua listing.
     */
    @Transactional
    public Optional<Review> createReview(Integer userId, Integer listingId, Integer rating, String comment) {
        Optional<User> u = userRepository.findById(userId);
        Optional<Listing> l = listingRepository.findById(listingId);
        if (u.isEmpty() || l.isEmpty()) return Optional.empty();

    // Kiểm tra user có mua listing này không: tìm Order với buyer, listing và status = Completed
    List<Order> orders = orderRepository.findByBuyerAndListingAndStatus(u.get(), l.get(), "Completed");
    boolean bought = orders != null && !orders.isEmpty();
    if (!bought) return Optional.empty();

        Review r = new Review();
        r.setUser(u.get());
        r.setListing(l.get());
        r.setRating(rating);
        r.setComment(comment);
        r.setCreatedAt(new Date());
        Review saved = reviewRepository.save(r);

        // Cập nhật điểm trung bình cho listing
        List<Review> all = reviewRepository.findByListing(l.get());
        double avg = all.stream().collect(Collectors.summarizingDouble(Review::getRating)).getAverage();
        Listing listing = l.get();
        listing.setAverageRating(avg);
        listingRepository.save(listing);

        return Optional.of(saved);
    }

    public List<Review> getReviewsForListing(Integer listingId) {
        Optional<Listing> l = listingRepository.findById(listingId);
        if (l.isEmpty()) return List.of();
        return reviewRepository.findByListing(l.get());
    }
}