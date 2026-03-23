package com.aurelia.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.ApplyDiscountRequestDto;
import com.aurelia.dto.BookResponseDto;
import com.aurelia.service.DiscountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/discounts")
@PreAuthorize("hasRole('SALES_MANAGER')")
public class DiscountController {

	private final DiscountService discountService;

	public DiscountController(DiscountService discountService) {
		this.discountService = discountService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.OK)
	public List<BookResponseDto> applyDiscount(@Valid @RequestBody ApplyDiscountRequestDto request) {
		return discountService.applyDiscount(request);
	}
}
