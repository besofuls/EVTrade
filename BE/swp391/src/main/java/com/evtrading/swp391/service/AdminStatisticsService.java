package com.evtrading.swp391.service;

import com.evtrading.swp391.dto.AdminStatsDTO;
import com.evtrading.swp391.dto.AdminStatsDTO.CategoryListingStat;
import com.evtrading.swp391.repository.ListingRepository;
import com.evtrading.swp391.repository.OrderRepository;
import com.evtrading.swp391.repository.PaymentRepository;
import com.evtrading.swp391.repository.TransactionRepository;
import com.evtrading.swp391.repository.projection.CategoryListingCountProjection;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminStatisticsService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ListingRepository listingRepository;
    private final TransactionRepository transactionRepository;

    public AdminStatisticsService(OrderRepository orderRepository,
                                  PaymentRepository paymentRepository,
                                  ListingRepository listingRepository,
                                  TransactionRepository transactionRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.listingRepository = listingRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getDashboardStats() {
        AdminStatsDTO dto = new AdminStatsDTO();

        BigDecimal totalOrders = defaultIfNull(orderRepository.sumTotalAmountByStatus("COMPLETED"));
        BigDecimal totalExtend = defaultIfNull(transactionRepository.sumAmountByReferenceTypeAndStatus("LISTING_EXTEND", "PAID"));

        List<CategoryListingCountProjection> projections = listingRepository.countListingsGroupedByCategory("ACTIVE");
        List<CategoryListingStat> categoryStats = projections.stream()
            .map(p -> new CategoryListingStat(p.getCategoryName(), p.getListingCount()))
            .collect(Collectors.toList());

        dto.setTotalOrderRevenue(totalOrders);
        dto.setTotalExtendRevenue(totalExtend);
        dto.setCategoryStats(categoryStats);
        return dto;
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
