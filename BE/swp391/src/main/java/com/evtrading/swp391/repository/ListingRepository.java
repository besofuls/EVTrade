package com.evtrading.swp391.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.repository.projection.CategoryListingCountProjection;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Integer>, JpaSpecificationExecutor<Listing> {
    Page<Listing> findByStatus(String status, Pageable pageable);
    Page<Listing> findByUserUserID(Integer userId, Pageable pageable);
    java.util.List<Listing> findAllByUserUserID(Integer userId);
    Page<Listing> findByCategoryCategoryID(Integer categoryId, Pageable pageable);
    Page<Listing> findByBrandBrandID(Integer brandId, Pageable pageable);
    Page<Listing> findByCategoryCategoryIDAndStatus(Integer categoryId, String status, Pageable pageable);
    Page<Listing> findByBrandBrandIDAndStatus(Integer brandId, String status, Pageable pageable);
    java.util.List<Listing> findByStatusAndExpiryDateBefore(String status, java.util.Date date);
    
    // Count titles (case-insensitive) to detect duplicate titles
    long countByTitleIgnoreCase(String title);

    // Count listings created by user after a given time (for rate limiting)
    long countByUserUserIDAndCreatedAtAfter(Integer userId, java.util.Date after);

    // Find all listings in a category (used for price anomaly checks)
    java.util.List<Listing> findAllByCategoryCategoryID(Integer categoryId);

    @Query("SELECT l.category.categoryName AS categoryName, COUNT(l) AS listingCount " +
           "FROM Listing l " +
           "WHERE (:status IS NULL OR UPPER(l.status) = UPPER(:status)) " +
           "GROUP BY l.category.categoryName")
    java.util.List<CategoryListingCountProjection> countListingsGroupedByCategory(@Param("status") String status);
    
    List<Listing> findByExpiryDateBeforeAndStatus(Date expiryDate, String status);
}
