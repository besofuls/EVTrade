package com.evtrading.swp391.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.evtrading.swp391.service.OrderService;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
public class VnpayController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/callback")
    public String vnpayCallback(@RequestParam Map<String, String> params) {
        // Xác thực chữ ký, cập nhật trạng thái Payment/Transaction
        boolean success = orderService.handleVnpayCallback(params);
        return success ? "Thanh toán thành công!" : "Thanh toán thất bại!";
    }

    @PostMapping("/ipn")
    public String vnpayIpn(@RequestParam Map<String, String> params) {
        boolean success = orderService.handleVnpayCallback(params);
        // VNPAY yêu cầu trả về "response_code=00" nếu thành công
        return success ? "response_code=00" : "response_code=99";
    }
}
