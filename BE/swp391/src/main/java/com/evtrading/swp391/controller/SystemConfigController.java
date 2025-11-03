package com.evtrading.swp391.controller;

import com.evtrading.swp391.entity.SystemConfig;
import com.evtrading.swp391.repository.SystemConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system-config")
@Tag(name = "System Config", description = "API for system configurations")
public class SystemConfigController {

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigController(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @GetMapping("/public")
    @Operation(summary = "Lấy các cấu hình hệ thống public", description = "Lấy giá trị của các cấu hình hệ thống dựa trên danh sách các 'key' được cung cấp.")
    public Map<String, String> getPublicConfigs(@RequestParam("keys") List<String> keys) {
        List<SystemConfig> configs = systemConfigRepository.findByConfigKeyIn(keys);
        return configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }
}