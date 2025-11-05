package com.evtrading.swp391.repository;

import com.evtrading.swp391.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Integer> {
    List<ListingImage> findByListingListingID(Integer listingId);
    void deleteByListingListingID(Integer listingId);

}
