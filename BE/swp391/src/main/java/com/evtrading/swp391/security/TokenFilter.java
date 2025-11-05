package com.evtrading.swp391.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class TokenFilter extends HttpFilter {

    private final JwtUtil jwtUtil;

    // public endpoints that don't require token
    private final List<String> publicPaths = Arrays.asList(
            "/api/users/login",
            "/api/users/register"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public TokenFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
        String path = req.getRequestURI();
        // Allow public endpoints
        for (String p : publicPaths) {
            if (pathMatcher.match(p, path)) {
                chain.doFilter(req, res);
                return;
            }
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // token valid, proceed
        chain.doFilter(req, res);
    }
}
