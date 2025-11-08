package com.evtrading.swp391.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AdminStatsDTO {
    private BigDecimal totalOrderRevenue;
    private BigDecimal totalExtendRevenue;
    private List<CategoryListingStat> categoryStats = new ArrayList<>();

    public BigDecimal getTotalOrderRevenue() {
        return totalOrderRevenue;
    }

    public void setTotalOrderRevenue(BigDecimal totalOrderRevenue) {
        this.totalOrderRevenue = totalOrderRevenue;
    }

    public BigDecimal getTotalExtendRevenue() {
        return totalExtendRevenue;
    }

    public void setTotalExtendRevenue(BigDecimal totalExtendRevenue) {
        this.totalExtendRevenue = totalExtendRevenue;
    }

    public List<CategoryListingStat> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(List<CategoryListingStat> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public static class CategoryListingStat {
        private String categoryName;
        private long listingCount;

        public CategoryListingStat() {
        }

        public CategoryListingStat(String categoryName, long listingCount) {
            this.categoryName = categoryName;
            this.listingCount = listingCount;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public long getListingCount() {
            return listingCount;
        }

        public void setListingCount(long listingCount) {
            this.listingCount = listingCount;
        }
    }
}
