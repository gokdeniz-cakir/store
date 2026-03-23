package com.aurelia.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreditCardRequestDto(
	@NotBlank(message = "cardNumber is required")
	@Pattern(regexp = "\\d{12,19}", message = "cardNumber must contain 12 to 19 digits")
	String cardNumber,

	@NotBlank(message = "cardholderName is required")
	@Size(max = 255, message = "cardholderName must be 255 characters or fewer")
	String cardholderName,

	@NotNull(message = "expiryMonth is required")
	@Min(value = 1, message = "expiryMonth must be between 1 and 12")
	@Max(value = 12, message = "expiryMonth must be between 1 and 12")
	Short expiryMonth,

	@NotNull(message = "expiryYear is required")
	@Min(value = 2024, message = "expiryYear must be a valid year")
	Integer expiryYear
) {
}
