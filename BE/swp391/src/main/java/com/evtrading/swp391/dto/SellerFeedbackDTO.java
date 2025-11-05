package com.evtrading.swp391.dto;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * DTO trả về thông tin feedback của 1 seller.
 */
public class SellerFeedbackDTO {
    private Integer sellerId;
    private String sellerName;
    private String sellerUsername;
    private String email;
    private String phone;
    private String address;
    private Date memberSince;
    private int totalListings;
    private double averageRating;
    private long totalReviews;
    private List<ListingFeedback> listings = new ArrayList<>();

    public Integer getSellerId() { return sellerId; }
    public void setSellerId(Integer sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerUsername() { return sellerUsername; }
    public void setSellerUsername(String sellerUsername) { this.sellerUsername = sellerUsername; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Date getMemberSince() { return memberSince; }
    public void setMemberSince(Date memberSince) { this.memberSince = memberSince; }
    public int getTotalListings() { return totalListings; }
    public void setTotalListings(int totalListings) { this.totalListings = totalListings; }
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
        private List<CommentFeedback> comments = new ArrayList<>();

        public Integer getListingId() { return listingId; }
        public void setListingId(Integer listingId) { this.listingId = listingId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public int getReviewCount() { return reviewCount; }
        public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
        public List<CommentFeedback> getComments() { return comments; }
        public void setComments(List<CommentFeedback> comments) { this.comments = comments; }
    }

    public static class CommentFeedback {
        private Integer reviewId;
        private Integer buyerId;
        private String buyerName;
        private int rating;
        private String comment;
        private Date createdAt;

        public Integer getReviewId() { return reviewId; }
        public void setReviewId(Integer reviewId) { this.reviewId = reviewId; }
        public Integer getBuyerId() { return buyerId; }
        public void setBuyerId(Integer buyerId) { this.buyerId = buyerId; }
        public String getBuyerName() { return buyerName; }
        public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public Date getCreatedAt() { return createdAt; }
        public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    }
}
