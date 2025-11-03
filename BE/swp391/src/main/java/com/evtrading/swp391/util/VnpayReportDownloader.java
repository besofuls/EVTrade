package com.evtrading.swp391.util;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Component;
import com.evtrading.swp391.service.VnpayReportClient;

@Component
public class VnpayReportDownloader {

    public List<VnpayReportClient.ReportItem> downloadReport(LocalDate valueDate) {
        // TODO: Gọi API/bóc tách CSV thực tế
        return List.of(new VnpayReportClient.ReportItem("TXN_SAMPLE", OffsetDateTime.now(), 0L));
    }
}