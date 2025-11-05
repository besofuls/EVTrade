package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.BrandDTO;
import com.evtrading.swp391.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/brands")
@Tag(name = "Brands", description = "API để quản lý thương hiệu")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @Operation(summary = "Tạo thương hiệu mới", description = "Tạo một thương hiệu mới")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandDTO) {
        try {
            BrandDTO createdBrand = brandService.createBrand(brandDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBrand);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}