package com.evtrading.swp391;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EntityScan("com.evtrading.swp391.entity")
@EnableJpaRepositories("com.evtrading.swp391.repository")
@SpringBootApplication
@EnableScheduling
public class Swp391Application {
	public static void main(String[] args) {
		SpringApplication.run(Swp391Application.class, args);
	}

}
