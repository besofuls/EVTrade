package com.evtrading.swp391.service;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.Order;
import com.evtrading.swp391.entity.Profile;
import com.evtrading.swp391.entity.Review;
import com.evtrading.swp391.entity.User;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.OrderRepository;
import com.evtrading.swp391.repository.ReviewRepository;
import com.evtrading.swp391.repository.UserRepository;
import com.evtrading.swp391.repository.ProfileRepository;
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
    private final ProfileRepository profileRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, ListingRepository listingRepository, OrderRepository orderRepository, ProfileRepository profileRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.profileRepository = profileRepository;
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
        List<Order> orders = orderRepository.findByBuyerAndListing(u.get(), l.get());
        boolean bought = orders != null && orders.stream()
                .anyMatch(o -> o.getStatus() != null && o.getStatus().equalsIgnoreCase("COMPLETED"));
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

    /**
     * Lấy feedback tổng quan cho một seller:
     * - Lấy tất cả listing của seller
     * - Với mỗi listing lấy danh sách review, tính average và số lượng, và lấy comments
     * - Tính tổng số review và điểm trung bình tổng quát cho seller
     */
    public com.evtrading.swp391.dto.SellerFeedbackDTO getSellerFeedback(Integer sellerId) {
        Optional<User> userOpt = userRepository.findById(sellerId);
        if (userOpt.isEmpty()) {
            return null;
        }

        User seller = userOpt.get();
        Profile profile = profileRepository.findByUser_UserID(sellerId).orElse(null);

        com.evtrading.swp391.dto.SellerFeedbackDTO result = new com.evtrading.swp391.dto.SellerFeedbackDTO();
        result.setSellerId(sellerId);
        result.setSellerUsername(seller.getUsername());
        result.setSellerName(profile != null && profile.getFullName() != null && !profile.getFullName().isBlank()
                ? profile.getFullName()
                : seller.getUsername());
        result.setEmail(seller.getEmail());
        result.setPhone(profile != null ? profile.getPhone() : null);
        result.setAddress(profile != null ? profile.getAddress() : null);
        result.setMemberSince(seller.getCreatedAt());

        // Lấy tất cả listing của seller (không phân trang vì dùng cho dashboard)
        java.util.List<com.evtrading.swp391.entity.Listing> listings = listingRepository.findAllByUserUserID(sellerId);
        if (listings == null) {
            listings = java.util.List.of();
        }
        result.setTotalListings(listings.size());

        java.util.List<com.evtrading.swp391.dto.SellerFeedbackDTO.ListingFeedback> listingFeedbacks = new java.util.ArrayList<>();
        long totalReviews = 0L;
        double weightedSum = 0.0;

        for (com.evtrading.swp391.entity.Listing li : listings) {
            java.util.List<Review> reviews = reviewRepository.findByListing(li);
            long count = reviews.size();
            double avg = 0.0;
            java.util.List<com.evtrading.swp391.dto.SellerFeedbackDTO.CommentFeedback> comments = new java.util.ArrayList<>();
            if (count > 0) {
                avg = reviews.stream().collect(Collectors.summarizingDouble(Review::getRating)).getAverage();
                reviews.forEach(r -> {
                    com.evtrading.swp391.dto.SellerFeedbackDTO.CommentFeedback c = new com.evtrading.swp391.dto.SellerFeedbackDTO.CommentFeedback();
                    c.setReviewId(r.getReviewID());
                    if (r.getUser() != null) {
                        c.setBuyerId(r.getUser().getUserID());
                        String buyerName = r.getUser().getUsername();
                        if (buyerName == null || buyerName.isBlank()) {
                            buyerName = r.getUser().getEmail();
                        }
                        c.setBuyerName(buyerName != null ? buyerName : "Ẩn danh");
                    }
                    if (r.getRating() != null) {
                        c.setRating(r.getRating());
                    }
                    c.setComment(r.getComment());
                    c.setCreatedAt(r.getCreatedAt());
                    comments.add(c);
                });
                comments.sort((c1, c2) -> {
                    Date d1 = c1.getCreatedAt();
                    Date d2 = c2.getCreatedAt();
                    if (d1 == null && d2 == null) return 0;
                    if (d1 == null) return 1;
                    if (d2 == null) return -1;
                    return d2.compareTo(d1);
                });
            }
            com.evtrading.swp391.dto.SellerFeedbackDTO.ListingFeedback lf = new com.evtrading.swp391.dto.SellerFeedbackDTO.ListingFeedback();
            lf.setListingId(li.getListingID());
            lf.setTitle(li.getTitle());
            lf.setAverageRating(avg);
            lf.setReviewCount((int) count);
            lf.setComments(comments);
            listingFeedbacks.add(lf);

            totalReviews += count;
            weightedSum += avg * count;
        }

        result.setListings(listingFeedbacks);
        result.setTotalReviews(totalReviews);
        double sellerAvg = totalReviews > 0 ? weightedSum / totalReviews : 0.0;
        result.setAverageRating(sellerAvg);
        return result;
    }
}
