package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueBreakdownPointDto(
	LocalDate date,
	String label,
	BigDecimal revenue,
	BigDecimal profit,
	Long orderCount
) {
}
