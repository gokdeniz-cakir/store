package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponseDto(
	Long id,
	BigDecimal totalPrice,
	BigDecimal refundAmount,
	String status,
	String shippingAddress,
	List<OrderItemResponseDto> items,
	Boolean canCancel,
	Boolean canRequestRefund,
	Instant createdAt,
	Instant deliveredAt,
	Instant refundRequestedAt,
	Instant updatedAt
) {
}
