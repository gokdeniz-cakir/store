package com.aurelia.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.OrderResponseDto;
import com.aurelia.dto.PlaceOrderRequestDto;
import com.aurelia.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public OrderResponseDto placeOrder(
		@Valid @RequestBody PlaceOrderRequestDto request,
		Authentication authentication
	) {
		return orderService.placeOrder(authentication.getName(), request);
	}

	@GetMapping
	public Page<OrderResponseDto> getOrders(
		Authentication authentication,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return orderService.getOrders(authentication.getName(), pageable);
	}

	@GetMapping("/{id}")
	public OrderResponseDto getOrder(@PathVariable Long id, Authentication authentication) {
		return orderService.getOrder(authentication.getName(), id);
	}
}
