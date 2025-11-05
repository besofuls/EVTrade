package com.evtrading.swp391.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.evtrading.swp391.dto.CategoryDTO;
import com.evtrading.swp391.entity.Category;
import com.evtrading.swp391.repository.CategoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryDTO createCategory(CategoryDTO dto) {
        Category category = new Category();
        category.setCategoryName(dto.getCategoryName());
        Category savedCategory = categoryRepository.save(category);

        CategoryDTO response = new CategoryDTO();
        response.setCategoryId(savedCategory.getCategoryID());
        response.setCategoryName(savedCategory.getCategoryName());
        return response;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream().map(category -> {
            CategoryDTO dto = new CategoryDTO();
            dto.setCategoryId(category.getCategoryID());
            dto.setCategoryName(category.getCategoryName());
            return dto;
        }).collect(Collectors.toList());
    }
}