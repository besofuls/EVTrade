package com.evtrading.swp391.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.evtrading.swp391.dto.BrandDTO;
import com.evtrading.swp391.entity.Brand;
import com.evtrading.swp391.repository.BrandRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public BrandDTO createBrand(BrandDTO dto) {
        Brand brand = new Brand();
        brand.setBrandName(dto.getBrandName());
        Brand savedBrand = brandRepository.save(brand);

        BrandDTO response = new BrandDTO();
        response.setBrandId(savedBrand.getBrandID());
        response.setBrandName(savedBrand.getBrandName());
        return response;
    }

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream().map(brand -> {
            BrandDTO dto = new BrandDTO();
            dto.setBrandId(brand.getBrandID());
            dto.setBrandName(brand.getBrandName());
            return dto;
        }).collect(Collectors.toList());
    }
}