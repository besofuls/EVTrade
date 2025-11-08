package com.evtrading.swp391.controller;

import com.evtrading.swp391.dto.AdminStatsDTO;
import com.evtrading.swp391.service.AdminStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    public AdminStatisticsController(AdminStatisticsService adminStatisticsService) {
        this.adminStatisticsService = adminStatisticsService;
    }

    @Operation(summary = "Admin/Moderator: Thống kê tổng quan", description = "Tổng doanh thu giao dịch, doanh thu gia hạn và thống kê bài đăng theo danh mục")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    @GetMapping("/overview")
    public ResponseEntity<AdminStatsDTO> getOverviewStats() {
        return ResponseEntity.ok(adminStatisticsService.getDashboardStats());
    }
}
