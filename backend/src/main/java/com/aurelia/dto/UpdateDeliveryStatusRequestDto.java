package com.aurelia.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDeliveryStatusRequestDto(
	@NotBlank(message = "status is required")
	String status
) {
}
