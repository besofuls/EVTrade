package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.UpdateExtendPriceRequest;
import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.repository.SystemConfigRepository;
import com.evtrading.swp391.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system-config")
@Tag(name = "System Config", description = "API for system configurations")
public class SystemConfigController {

    private final SystemConfigRepository systemConfigRepository;
    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigRepository systemConfigRepository, SystemConfigService systemConfigService) {
        this.systemConfigRepository = systemConfigRepository;
        this.systemConfigService = systemConfigService;
    }

    @GetMapping("/public")
    @Operation(summary = "Lấy các cấu hình hệ thống public", description = "Lấy giá trị của các cấu hình hệ thống dựa trên danh sách các 'key' được cung cấp.")
    public Map<String, String> getPublicConfigs(@RequestParam("keys") List<String> keys) {
        List<SystemConfig> configs = systemConfigRepository.findByConfigKeyIn(keys);
        return configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }

    @PutMapping("/extend-price")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cập nhật giá gia hạn mỗi ngày", description = "Chỉ admin mới được phép thay đổi giá gia hạn bài đăng theo ngày.")
    public Map<String, String> updateExtendPrice(@RequestBody UpdateExtendPriceRequest request) {
        int updated = systemConfigService.updateExtendPricePerDay(request.getPricePerDay());
        return Map.of("EXTEND_PRICE_PER_DAY", String.valueOf(updated));
    }
}