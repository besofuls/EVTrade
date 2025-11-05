package com.evtrading.swp391.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evtrading.swp391.dto.BrandDTO;
import com.evtrading.swp391.service.BrandService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

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

    @Operation(summary = "Lấy danh sách thương hiệu", description = "Lấy tất cả thương hiệu")
    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        List<BrandDTO> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

}