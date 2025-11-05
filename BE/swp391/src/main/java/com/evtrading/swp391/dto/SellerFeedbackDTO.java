package com.evtrading.swp391.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO trả về thông tin feedback của 1 seller.
 */
public class SellerFeedbackDTO {
    private Integer sellerId;
    private double averageRating;
    private long totalReviews;
    private List<ListingFeedback> listings = new ArrayList<>();

    public Integer getSellerId() { return sellerId; }
    public void setSellerId(Integer sellerId) { this.sellerId = sellerId; }
    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }
    public List<ListingFeedback> getListings() { return listings; }
    public void setListings(List<ListingFeedback> listings) { this.listings = listings; }

    public static class ListingFeedback {
        private Integer listingId;
        private String title;
        private double averageRating;
        private int reviewCount;
        private List<String> comments = new ArrayList<>();

        public Integer getListingId() { return listingId; }
        public void setListingId(Integer listingId) { this.listingId = listingId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public int getReviewCount() { return reviewCount; }
        public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
        public List<String> getComments() { return comments; }
        public void setComments(List<String> comments) { this.comments = comments; }
    }
}
