package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.Review;
import com.evtrading.swp391.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByListing(Listing listing);
}
