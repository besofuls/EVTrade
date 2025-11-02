package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.ListingRequestDTO;
import com.evtrading.swp391.dto.ListingResponseDTO;
import com.evtrading.swp391.service.ListingService;
import com.evtrading.swp391.dto.ListingSearchCriteria;
import com.evtrading.swp391.service.ListingSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/listings")
@Tag(name = "Listings", description = "API để quản lý bài đăng sản phẩm")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private ListingSearchService listingSearchService;

    @Operation(summary = "Tạo bài đăng mới kèm ảnh", description = "Đăng bài mới cho xe hoặc pin và upload ảnh ngay")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponseDTO> createListing(
            @RequestPart(value = "listing", required = true) String listingJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) throws IOException {

        // Chuyển đổi json string sang object
        ObjectMapper mapper = new ObjectMapper();
        ListingRequestDTO listingRequest = mapper.readValue(listingJson, ListingRequestDTO.class);

        // Tiếp tục xử lý như bình thường
        ListingResponseDTO createdListing = listingService.createListing(listingRequest, images,
                authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdListing);
    }

    @Operation(summary = "Cập nhật bài đăng kèm ảnh", description = "Chỉ bài đăng bị flagged hoặc bị từ chối mới được cập nhật")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponseDTO> updateListing(
            @PathVariable Integer id,
            @RequestPart(value = "listing", required = true) String listingJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) throws IOException {

        System.out.println(">>> [updateListing] Authenticated user: " + (authentication != null ? authentication.getName() : "null"));

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ObjectMapper mapper = new ObjectMapper();
        ListingRequestDTO listingRequest = mapper.readValue(listingJson, ListingRequestDTO.class);

        try {
            ListingResponseDTO updatedListing = listingService.updateListing(id, listingRequest, images, authentication.getName());
            return ResponseEntity.ok(updatedListing);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getMessage().contains("flagged") || e.getMessage().contains("rejected")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Sửa phương thức getListings để rõ ràng hơn trong việc lọc bài đăng
    @Operation(summary = "Lấy danh sách bài đăng", description = "Lấy danh sách bài đăng theo các tiêu chí")
    @GetMapping
    public ResponseEntity<Page<ListingResponseDTO>> getListings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        boolean isModerator = false;

        // Kiểm tra role của người dùng
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR") || a.getAuthority().equals("ROLE_ADMIN"))) {
            isModerator = true;
        }

        Page<ListingResponseDTO> listings = listingService.getListings(status, userId, categoryId, brandId, pageable,
                isModerator);
        return ResponseEntity.ok(listings);
    }

    @SecurityRequirements
    @Operation(summary = "Lấy chi tiết bài đăng", description = "Lấy thông tin chi tiết của một bài đăng")
    @GetMapping("/{id}")
    public ResponseEntity<ListingResponseDTO> getListingById(@PathVariable Integer id) {
        try {
            ListingResponseDTO listing = listingService.getListingById(id);
            return ResponseEntity.ok(listing);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Thêm API endpoint mới cho approve/reject
    @Operation(summary = "Phê duyệt bài đăng", description = "Moderator phê duyệt bài đăng")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ListingResponseDTO> approveListing(@PathVariable Integer id) {
        try {
            ListingResponseDTO approvedListing = listingService.approveListing(id);
            return ResponseEntity.ok(approvedListing);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @Operation(summary = "Từ chối bài đăng", description = "Moderator từ chối bài đăng")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ListingResponseDTO> rejectListing(
            @PathVariable Integer id,
            @RequestParam(required = false) String reason) {
        try {
            ListingResponseDTO rejectedListing = listingService.rejectListing(id, reason);
            return ResponseEntity.ok(rejectedListing);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @SecurityRequirements
    @Operation(summary = "Tìm kiếm bài đăng", description = "Tìm kiếm theo từ khóa, category, brand, khoảng giá, năm sản xuất...")
    @GetMapping("/search")
    public ResponseEntity<Page<ListingResponseDTO>> searchListings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) Integer maxYear,
            @RequestParam(required = false) Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        boolean isModerator = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR") || a.getAuthority().equals("ROLE_ADMIN"));

        ListingSearchCriteria criteria = new ListingSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setCategoryId(categoryId);
        criteria.setBrandId(brandId);
        criteria.setStatus(status);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);
        criteria.setMinYear(minYear);
        criteria.setMaxYear(maxYear);
        criteria.setUserId(userId);

        Page<ListingResponseDTO> result = listingSearchService.search(criteria, pageable, isModerator);
        return ResponseEntity.ok(result);
    }
}
