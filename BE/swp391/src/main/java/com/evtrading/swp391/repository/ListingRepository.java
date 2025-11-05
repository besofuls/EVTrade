package com.evtrading.swp391.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.evtrading.swp391.entity.Listing;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Integer>, JpaSpecificationExecutor<Listing> {
    Page<Listing> findByStatus(String status, Pageable pageable);
    Page<Listing> findByUserUserID(Integer userId, Pageable pageable);
    Page<Listing> findByCategoryCategoryID(Integer categoryId, Pageable pageable);
    Page<Listing> findByBrandBrandID(Integer brandId, Pageable pageable);
    Page<Listing> findByCategoryCategoryIDAndStatus(Integer categoryId, String status, Pageable pageable);
    Page<Listing> findByBrandBrandIDAndStatus(Integer brandId, String status, Pageable pageable);
    
    // Count titles (case-insensitive) to detect duplicate titles
    long countByTitleIgnoreCase(String title);

    // Count listings created by user after a given time (for rate limiting)
    long countByUserUserIDAndCreatedAtAfter(Integer userId, java.util.Date after);

    // Find all listings in a category (used for price anomaly checks)
    java.util.List<Listing> findAllByCategoryCategoryID(Integer categoryId);
}
