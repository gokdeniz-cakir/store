package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminDeliveryResponseDto(
	Long id,
	Long orderId,
	Long bookId,
	String bookTitle,
	String customerName,
	String customerEmail,
	Integer quantity,
	BigDecimal totalPrice,
	String shippingAddress,
	String status,
	Instant createdAt,
	Instant updatedAt
) {
}
