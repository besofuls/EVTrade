package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Integer>, JpaSpecificationExecutor<Listing> {
    Page<Listing> findByStatus(String status, Pageable pageable);
    Page<Listing> findByUserUserID(Integer userId, Pageable pageable);
    Page<Listing> findByCategoryCategoryID(Integer categoryId, Pageable pageable);
    Page<Listing> findByBrandBrandID(Integer brandId, Pageable pageable);
    Page<Listing> findByCategoryCategoryIDAndStatus(Integer categoryId, String status, Pageable pageable);
    Page<Listing> findByBrandBrandIDAndStatus(Integer brandId, String status, Pageable pageable);
}
