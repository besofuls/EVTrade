package com.evtrading.swp391.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.evtrading.swp391.dto.VnpayCallbackResultDTO;
import com.evtrading.swp391.service.VnpayService; // Thêm import
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
public class VnpayController {
    @Autowired
    private VnpayService vnpayService; // Thay OrderService bằng VnpayService

    @GetMapping("/callback")
    public void vnpayCallback(@RequestParam Map<String, String> params, HttpServletResponse response)
            throws java.io.IOException {
        VnpayCallbackResultDTO result = vnpayService.handleVnpayCallback(params);

        String redirectUrl;
        // Dựa vào loại giao dịch để quyết định URL redirect
        if ("LISTING_EXTEND".equals(result.getTransactionType())) {
            redirectUrl = "http://localhost:5173/my-listings?payment_status=" + (result.isSuccess() ? "success" : "fail");
        } else { // Mặc định là cho order
            redirectUrl = "http://localhost:5173/orders-payment?status=" + (result.isSuccess() ? "success" : "fail");
        }
        
        redirectUrl += "&reason=" + java.net.URLEncoder.encode(result.getMessage(), "UTF-8");
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/ipn")
    public String vnpayIpn(@RequestParam Map<String, String> params) {
        VnpayCallbackResultDTO result = vnpayService.handleVnpayCallback(params);
        // VNPAY yêu cầu trả về mã này để xác nhận đã nhận IPN
        return result.isSuccess() ? "00" : "01";
    }
}
