package com.evtrading.swp391.config;

import org.springframework.util.AntPathMatcher;

/**
 * Centralizes the definition of publicly accessible HTTP paths so that
 * security-related components (filters, config) share the same source
 * of truth.
 */
public final class SecurityPaths {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private static final String[] PUBLIC_ENDPOINTS = new String[] {
            "/api/auth/**",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private SecurityPaths() {
        // Utility class
    }

    /**
     * Returns the list of public endpoints. The returned array is a copy to
     * prevent callers from mutating the internal static state.
     */
    public static String[] publicEndpoints() {
        return PUBLIC_ENDPOINTS.clone();
    }

    /**
     * Determines whether the provided request path should be treated as public.
     *
     * @param servletPath the servlet path extracted from the incoming request
     * @return {@code true} if the path matches one of the public endpoint
     * patterns; {@code false} otherwise
     */
    public static boolean isPublicPath(String servletPath) {
        if (servletPath == null) {
            return false;
        }

        for (String pattern : PUBLIC_ENDPOINTS) {
            if (PATH_MATCHER.match(pattern, servletPath)) {
                return true;
            }
        }
        return false;
    }
}
