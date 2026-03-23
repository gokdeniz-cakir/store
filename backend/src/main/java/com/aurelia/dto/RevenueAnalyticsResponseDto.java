package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueAnalyticsResponseDto(
	LocalDate startDate,
	LocalDate endDate,
	BigDecimal revenue,
	BigDecimal profit,
	BigDecimal discountTotal,
	Long orderCount,
	List<RevenueBreakdownPointDto> breakdown
) {
}
