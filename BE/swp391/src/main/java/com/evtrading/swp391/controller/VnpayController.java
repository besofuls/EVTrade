package com.evtrading.swp391.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.evtrading.swp391.dto.VnpayCallbackResultDTO;
import com.evtrading.swp391.service.OrderService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
public class VnpayController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/callback")
    public void vnpayCallback(@RequestParam Map<String, String> params, HttpServletResponse response)
            throws java.io.IOException {
        VnpayCallbackResultDTO result = orderService.handleVnpayCallback(params);
        String redirectUrl = "http://localhost:5173/orders-payment?status=" + (result.isSuccess() ? "success" : "fail")
                + "&reason=" + java.net.URLEncoder.encode(result.getMessage(), "UTF-8");
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/ipn")
    public String vnpayIpn(@RequestParam Map<String, String> params) {
        VnpayCallbackResultDTO result = orderService.handleVnpayCallback(params);
        return result.isSuccess() ? "response_code=00" : "response_code=99";
    }
}
