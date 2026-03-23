package com.aurelia.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequestDto(
	@NotNull(message = "rating is required")
	@Min(value = 1, message = "rating must be between 1 and 5")
	@Max(value = 5, message = "rating must be between 1 and 5")
	Short rating,

	@Size(max = 5000, message = "comment must be 5000 characters or fewer")
	String comment
) {
}
