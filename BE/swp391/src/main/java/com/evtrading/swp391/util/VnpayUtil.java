package com.evtrading.swp391.util;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

public class VnpayUtil {

    public static String createPaymentUrl(String tmnCode, String hashSecret, String payUrl, String returnUrl,
                                          BigDecimal amount, String paymentId, String ipAddr) {

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", paymentId);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + paymentId); // Không # để tránh lỗi
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddr);

        // Thời gian tạo
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        params.put("vnp_CreateDate", createDate);

        // Thời gian hết hạn: +15 phút (theo demo VNPAY)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        cld.add(Calendar.MINUTE, 15);
        String expireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());
        params.put("vnp_ExpireDate", expireDate);

        // BƯỚC 1: Tạo hashData (theo demo VNPAY – dùng US_ASCII)
        String hashData = buildHashData(params);

        // BƯỚC 2: Tạo secureHash
        String secureHash = hmacSHA512(hashSecret, hashData);

        // BƯỚC 3: Tạo query string (dùng UTF-8 cho URL – chuẩn Spring)
        StringBuilder query = new StringBuilder();
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String value = params.get(fieldName);
            if (value != null && !value.isEmpty()) {
                if (i > 0) query.append("&");
                query.append(fieldName)
                     .append("=")
                     .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
            }
        }
        query.append("&vnp_SecureHash=").append(secureHash);

        // In log để debug (có thể xóa sau)
        System.out.println("HashData: " + hashData);
        System.out.println("SecureHash: " + secureHash);

        return payUrl + "?" + query.toString();
    }

    /**
     * Tạo hash data theo đúng demo VNPAY
     * - Sort key
     * - Encode value bằng US_ASCII
     * - Bao gồm vnp_ExpireDate
     */
    public static String buildHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();

        for (String fieldName : fieldNames) {
            String value = params.get(fieldName);
            if (value != null && !value.isEmpty() && !"vnp_SecureHash".equals(fieldName)) {
                if (hashData.length() > 0) {
                    hashData.append('&');
                }
                // ENCODE BẰNG US_ASCII – THEO DEMO VNPAY
                String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);
                hashData.append(fieldName).append('=').append(encodedValue);
            }
        }
        return hashData.toString();
    }

    /**
     * HMAC SHA512 – giống hệt demo VNPAY
     */
    public static String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error while generating HMAC SHA512", e);
        }
    }
}