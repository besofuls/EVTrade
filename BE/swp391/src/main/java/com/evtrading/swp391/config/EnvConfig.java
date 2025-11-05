package com.evtrading.swp391.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class EnvConfig {

    @Autowired
    private ConfigurableEnvironment environment;

    @PostConstruct
    public void loadDotenvAsPropertySource() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        Map<String, Object> map = new HashMap<>();
        dotenv.entries().forEach(e -> map.put(e.getKey(), e.getValue()));
        // put dotenv values first so they override other sources if present
        environment.getPropertySources().addFirst(new MapPropertySource("dotenv", map));
    }
}