package com.evtrading.swp391.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public FilterRegistrationBean<TokenFilter> tokenFilter() {
        FilterRegistrationBean<TokenFilter> registrationBean = new FilterRegistrationBean<>();
        TokenFilter filter = new TokenFilter(jwtUtil);
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/api/users/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
