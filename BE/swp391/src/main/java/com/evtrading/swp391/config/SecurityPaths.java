package com.evtrading.swp391.config;

import org.springframework.util.AntPathMatcher;

/**
 * Centralizes security path patterns so the configuration has a single source of truth.
 */
public final class SecurityPaths {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();


    private static final String[] AUTH_ENDPOINTS = new String[] {
        "/api/auth/**"
    };

    private static final String[] PUBLIC_ENDPOINTS = new String[] {
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/api/vnpay/ipn",
        "/api/vnpay/callback",
        "/api/listings/search",
        "/api/brands",
        "/api/categories",
        // DocuSeal webhook callback (no auth; verified by header secret)
        "/api/contracts/webhook",
        "/api/system-config/public/**", // Thêm dòng này
        "/api/sellers/**",

    };

    private static final String[] MEMBER_ENDPOINTS = new String[] {
        "/api/orders/**",
        "/api/transactions/**",
        "/api/listings/**"

    };

    private static final String[] MODERATOR_ENDPOINTS = new String[] {
        // Add moderator-only endpoints here
    };

    private static final String[] ADMIN_ENDPOINTS = new String[] {
        // Add admin-only endpoints here
    };

    private SecurityPaths() {
        // Utility class
    }

    public static String[] authEndpoints() {
        return AUTH_ENDPOINTS.clone();
    }

    public static String[] publicEndpoints() {
        return PUBLIC_ENDPOINTS.clone();
    }

    public static String[] memberEndpoints() {
        return MEMBER_ENDPOINTS.clone();
    }

    public static String[] moderatorEndpoints() {
        return MODERATOR_ENDPOINTS.clone();
    }

    public static String[] adminEndpoints() {
        return ADMIN_ENDPOINTS.clone();
    }

    public static boolean isPublicPath(String servletPath) {
        return matches(servletPath, PUBLIC_ENDPOINTS) || matches(servletPath, AUTH_ENDPOINTS);
    }

    private static boolean matches(String path, String[] patterns) {
        if (path == null || patterns == null) return false;
        for (String pattern : patterns) {
            if (PATH_MATCHER.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }
}
