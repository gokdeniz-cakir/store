package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminRefundRequestResponseDto(
	Long orderId,
	String customerName,
	String customerEmail,
	String shippingAddress,
	String status,
	BigDecimal totalPrice,
	BigDecimal refundAmount,
	Instant createdAt,
	Instant deliveredAt,
	Instant refundRequestedAt,
	List<OrderItemResponseDto> items
) {
}
