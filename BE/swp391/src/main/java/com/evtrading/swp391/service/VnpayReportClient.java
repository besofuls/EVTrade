package com.evtrading.swp391.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public interface VnpayReportClient {
    List<ReportItem> fetchDailyReport(LocalDate valueDate);

    record ReportItem(String txnRef, OffsetDateTime paidAt, long amount) {}
}