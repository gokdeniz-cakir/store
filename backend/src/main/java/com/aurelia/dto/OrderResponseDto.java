package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponseDto(
	Long id,
	BigDecimal totalPrice,
	String status,
	String shippingAddress,
	List<OrderItemResponseDto> items,
	Instant createdAt,
	Instant updatedAt
) {
}
