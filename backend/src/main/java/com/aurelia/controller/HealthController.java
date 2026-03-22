package com.aurelia.controller;

import java.time.Instant;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.HealthResponseDto;

@RestController
@RequestMapping("/api")
public class HealthController {

	private final Environment environment;
	private final String applicationName;

	public HealthController(
		Environment environment,
		@Value("${spring.application.name}") String applicationName
	) {
		this.environment = environment;
		this.applicationName = applicationName;
	}

	@GetMapping("/health")
	public HealthResponseDto health() {
		return new HealthResponseDto(
			"UP",
			applicationName,
			Instant.now(),
			Arrays.stream(environment.getActiveProfiles()).toList()
		);
	}
}
