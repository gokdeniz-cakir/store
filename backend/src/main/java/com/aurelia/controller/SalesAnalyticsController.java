package com.aurelia.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.AdminInvoiceResponseDto;
import com.aurelia.dto.RevenueAnalyticsResponseDto;
import com.aurelia.service.SalesAnalyticsService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SALES_MANAGER')")
public class SalesAnalyticsController {

	private final SalesAnalyticsService salesAnalyticsService;

	public SalesAnalyticsController(SalesAnalyticsService salesAnalyticsService) {
		this.salesAnalyticsService = salesAnalyticsService;
	}

	@GetMapping("/invoices")
	public List<AdminInvoiceResponseDto> getInvoices(
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
	) {
		return salesAnalyticsService.getInvoices(startDate, endDate);
	}

	@GetMapping("/revenue")
	public RevenueAnalyticsResponseDto getRevenueAnalytics(
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
	) {
		return salesAnalyticsService.getRevenueAnalytics(startDate, endDate);
	}
}
