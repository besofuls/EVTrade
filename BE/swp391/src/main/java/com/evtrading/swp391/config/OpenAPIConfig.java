package com.evtrading.swp391.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        // Tạo security scheme cho JWT
        SecurityScheme securityScheme = new SecurityScheme()
                .name(securitySchemeName)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");
                
        // Tạo OpenAPI info
        Info apiInfo = new Info()
                .title("SWP391 API")
                .description("API Documentation for Electric Vehicle Trading Platform")
                .version("1.0.0");
                
        // Trả về OpenAPI object với security requirement mặc định
        return new OpenAPI()
                .info(apiInfo)
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, securityScheme))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName));
    }
}
