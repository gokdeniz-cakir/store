package com.aurelia.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ApplyDiscountRequestDto(
	@NotEmpty(message = "bookIds must not be empty")
	List<@NotNull(message = "bookId is required") Long> bookIds,

	@NotNull(message = "percentage is required")
	@Min(value = 1, message = "percentage must be between 1 and 100")
	@Max(value = 100, message = "percentage must be between 1 and 100")
	Integer percentage
) {
}
