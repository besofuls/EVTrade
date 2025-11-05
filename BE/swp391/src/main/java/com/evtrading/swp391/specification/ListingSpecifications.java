package com.evtrading.swp391.specification;

import com.evtrading.swp391.dto.ListingSearchCriteria;
import com.evtrading.swp391.entity.Listing;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;

public class ListingSpecifications {

    public static Specification<Listing> build(ListingSearchCriteria c, boolean isModerator) {
        return Specification
                .where(statusScope(isModerator, c.getStatus()))
                .and(keyword(c.getKeyword()))
                .and(categoryId(c.getCategoryId()))
                .and(brandId(c.getBrandId()))
                .and(priceGte(c.getMinPrice()))
                .and(priceLte(c.getMaxPrice()))
                .and(yearGte(c.getMinYear()))
                .and(yearLte(c.getMaxYear()))
                .and(userId(c.getUserId()));
    }

    private static Specification<Listing> statusScope(boolean isModerator, String requestedStatus) {
        return (root, q, cb) -> {
            if (isModerator) {
                if (requestedStatus != null && !requestedStatus.isBlank()) {
                    return cb.equal(root.get("status"), requestedStatus);
                }
                return cb.conjunction();
            } else {
                return cb.equal(root.get("status"), "ACTIVE");
            }
        };
    }

    private static Specification<Listing> keyword(String keyword) {
        return (root, q, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("brand").get("brandName")), like),
                    cb.like(cb.lower(root.get("category").get("categoryName")), like)
            );
        };
    }

    private static Specification<Listing> categoryId(Integer categoryId) {
        return (root, q, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.get("category").get("categoryID"), categoryId);
        };
    }

    private static Specification<Listing> brandId(Integer brandId) {
        return (root, q, cb) -> {
            if (brandId == null) return cb.conjunction();
            return cb.equal(root.get("brand").get("brandID"), brandId);
        };
    }

    private static Specification<Listing> priceGte(BigDecimal minPrice) {
        return (root, q, cb) -> {
            if (minPrice == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    private static Specification<Listing> priceLte(BigDecimal maxPrice) {
        return (root, q, cb) -> {
            if (maxPrice == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    private static Specification<Listing> yearGte(Integer minYear) {
        return (root, q, cb) -> {
            if (minYear == null) return cb.conjunction();
            // Kiểm tra nếu có vehicle và có năm sản xuất
            return cb.and(
                cb.isNotNull(root.get("vehicle")),
                cb.greaterThanOrEqualTo(root.get("vehicle").get("year"), minYear)
            );
        };
    }

    private static Specification<Listing> yearLte(Integer maxYear) {
        return (root, q, cb) -> {
            if (maxYear == null) return cb.conjunction();
            // Kiểm tra nếu có vehicle và có năm sản xuất
            return cb.and(
                cb.isNotNull(root.get("vehicle")),
                cb.lessThanOrEqualTo(root.get("vehicle").get("year"), maxYear)
            );
        };
    }

    private static Specification<Listing> userId(Integer userId) {
        return (root, q, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("user").get("userID"), userId);
        };
    }
}