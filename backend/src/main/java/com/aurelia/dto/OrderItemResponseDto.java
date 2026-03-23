package com.aurelia.dto;

import java.math.BigDecimal;

public record OrderItemResponseDto(
	Long bookId,
	String title,
	String author,
	String coverColor,
	Integer quantity,
	BigDecimal unitPrice,
	BigDecimal discountApplied,
	BigDecimal lineTotal
) {
}
