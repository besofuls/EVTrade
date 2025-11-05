package com.evtrading.swp391.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.evtrading.swp391.entity.Payment;
import com.evtrading.swp391.repository.PaymentRepository;

@Service
public class SettlementService {

    private final PaymentRepository paymentRepository;
    private final VnpayReportClient vnpayReportClient;
    private final CommissionService commissionService;
    private final PayoutService payoutService;

    public SettlementService(
            PaymentRepository paymentRepository,
            VnpayReportClient vnpayReportClient,
            CommissionService commissionService,
            PayoutService payoutService) {
        this.paymentRepository = paymentRepository;
        this.vnpayReportClient = vnpayReportClient;
        this.commissionService = commissionService;
        this.payoutService = payoutService;
    }

    @Scheduled(cron = "0 30 2 * * *") // 02:30 hằng ngày
    @Transactional
    public void reconcileAndPayout() {
        List<VnpayReportClient.ReportItem> report = vnpayReportClient.fetchDailyReport(LocalDate.now().minusDays(1));
        for (VnpayReportClient.ReportItem item : report) {
            paymentRepository.findByTxnRef(item.txnRef()).ifPresent(payment -> {
                if (!payment.getStatus().equals("PAID")) {
                    payment.setStatus("PAID");
                    payment.setPaidAt(Date.from(item.paidAt().toInstant()));
                    paymentRepository.save(payment);
                }
            });
        }

        List<Payment> ready = paymentRepository.findAllByStatus("PAID");
        ready.forEach(payment -> {
            // 1. Tính hoa hồng
            BigDecimal commission = commissionService.calculateCommission(payment);
            BigDecimal netAmount = payment.getAmount().subtract(commission);
            
            Integer sellerId = resolveSellerId(payment);
            payment.setSellerId(sellerId);

            payoutService.queuePayout(sellerId, netAmount, payment.getPaymentID());
            payment.setStatus("READY_FOR_PAYOUT");
            
            // 2. LƯU HOA HỒNG VÀO DATABASE
            payment.setCommissionAmount(commission); 
            
            paymentRepository.save(payment);
        });

        List<Payment> queued = paymentRepository.findAllByStatus("READY_FOR_PAYOUT");
        queued.forEach(payment -> {
            boolean success = payoutService.executePayout(payment);
            payment.setStatus(success ? "PAID_OUT" : "PAYOUT_FAILED");
            paymentRepository.save(payment);
        });
    }

    private Integer resolveSellerId(Payment payment) {
        if (payment.getTransaction() != null && payment.getTransaction().getOrder() != null) {
            var order = payment.getTransaction().getOrder();
            if (order.getSeller() != null) {
                return order.getSeller().getUserID();
            }
            if (order.getListing() != null && order.getListing().getUser() != null) {
                return order.getListing().getUser().getUserID();
            }
        }
        throw new IllegalStateException("Cannot determine seller for payment " + payment.getPaymentID());
    }
}