package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminInvoiceResponseDto(
	Long orderId,
	String invoiceNumber,
	String customerName,
	String customerEmail,
	String status,
	Integer itemCount,
	BigDecimal totalPrice,
	BigDecimal discountTotal,
	Instant issuedAt
) {
}
