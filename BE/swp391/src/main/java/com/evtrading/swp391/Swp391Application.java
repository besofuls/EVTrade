package com.evtrading.swp391;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EntityScan("com.evtrading.swp391.entity")
@EnableJpaRepositories("com.evtrading.swp391.repository")
@SpringBootApplication
public class Swp391Application {

	public static void main(String[] args) {
		SpringApplication.run(Swp391Application.class, args);
	}

}
