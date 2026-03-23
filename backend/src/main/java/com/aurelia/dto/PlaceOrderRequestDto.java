package com.aurelia.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlaceOrderRequestDto(
	@NotBlank(message = "shippingAddress is required")
	@Size(max = 1000, message = "shippingAddress must be 1000 characters or fewer")
	String shippingAddress,

	@NotNull(message = "creditCard is required")
	@Valid
	CreditCardRequestDto creditCard,

	@NotEmpty(message = "items must contain at least one entry")
	List<@Valid OrderItemRequestDto> items
) {
}
