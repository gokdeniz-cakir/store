package com.aurelia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AureliaEditionsApplication {

	public static void main(String[] args) {
		SpringApplication.run(AureliaEditionsApplication.class, args);
	}

}
