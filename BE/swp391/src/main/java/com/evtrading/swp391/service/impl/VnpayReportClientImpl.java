package com.evtrading.swp391.service.impl;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import com.evtrading.swp391.service.VnpayReportClient;
import com.evtrading.swp391.util.VnpayReportDownloader;

@Service
public class VnpayReportClientImpl implements VnpayReportClient {

    private final VnpayReportDownloader downloader;

    public VnpayReportClientImpl(VnpayReportDownloader downloader) {
        this.downloader = downloader;
    }

    @Override
    public List<ReportItem> fetchDailyReport(LocalDate valueDate) {
        return downloader.downloadReport(valueDate);
    }
}