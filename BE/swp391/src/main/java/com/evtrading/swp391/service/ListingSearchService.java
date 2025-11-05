package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.ListingResponseDTO;
import com.evtrading.swp391.dto.ListingSearchCriteria;
import com.evtrading.swp391.entity.Listing;
import com.evtrading.swp391.entity.ListingImage;
import com.evtrading.swp391.mapper.ListingMapper;
import com.evtrading.swp391.repository.ListingImageRepository;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.specification.ListingSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListingSearchService {

    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private ListingImageRepository listingImageRepository;
    
    @Autowired
    private ListingMapper listingMapper;

    public Page<ListingResponseDTO> search(ListingSearchCriteria criteria, Pageable pageable, boolean isModerator) {
        Page<Listing> page = listingRepository.findAll(
            ListingSpecifications.build(criteria, isModerator), 
            pageable
        );
        
        return page.map(listing -> {
            List<ListingImage> images = listingImageRepository.findByListingListingID(listing.getListingID());
            return listingMapper.toDto(listing, images);
        });
    }
}