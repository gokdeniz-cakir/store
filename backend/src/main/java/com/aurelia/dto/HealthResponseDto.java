package com.aurelia.dto;

import java.time.Instant;
import java.util.List;

public record HealthResponseDto(
	String status,
	String application,
	Instant timestamp,
	List<String> profiles
) {
}
