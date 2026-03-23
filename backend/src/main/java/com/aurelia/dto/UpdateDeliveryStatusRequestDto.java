package com.aurelia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateDeliveryStatusRequestDto(
	@NotBlank(message = "status is required")
	@Pattern(
		regexp = "PROCESSING|IN_TRANSIT|DELIVERED",
		message = "status must be one of PROCESSING, IN_TRANSIT, or DELIVERED"
	)
	String status
) {
}
