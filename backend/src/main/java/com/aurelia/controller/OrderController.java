package com.aurelia.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	@PreAuthorize("hasRole('CUSTOMER')")
	@ResponseStatus(HttpStatus.CREATED)
	public OrderResponseDto placeOrder(
		@Valid @RequestBody PlaceOrderRequestDto request,
		Authentication authentication
	) {
		return orderService.placeOrder(authentication.getName(), request);
	}

	@GetMapping
	@PreAuthorize("hasRole('CUSTOMER')")
	public Page<OrderResponseDto> getOrders(
		Authentication authentication,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return orderService.getOrders(authentication.getName(), pageable);
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('CUSTOMER')")
	public OrderResponseDto getOrder(@PathVariable Long id, Authentication authentication) {
		return orderService.getOrder(authentication.getName(), id);
	}

	@PatchMapping("/{id}/cancel")
	@PreAuthorize("hasRole('CUSTOMER')")
	public OrderResponseDto cancelOrder(@PathVariable Long id, Authentication authentication) {
		return orderService.cancelOrder(authentication.getName(), id);
	}

	@PostMapping("/{id}/refund")
	@PreAuthorize("hasRole('CUSTOMER')")
	public OrderResponseDto requestRefund(@PathVariable Long id, Authentication authentication) {
		return orderService.requestRefund(authentication.getName(), id);
	}

	@GetMapping("/{id}/invoice")
	@PreAuthorize("hasAnyRole('CUSTOMER', 'SALES_MANAGER')")
	public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id, Authentication authentication) {
		boolean salesManager = authentication.getAuthorities().stream()
			.anyMatch(authority -> "ROLE_SALES_MANAGER".equals(authority.getAuthority()));

		byte[] invoicePdf = orderService.getInvoice(authentication.getName(), id, salesManager);

		return ResponseEntity.ok()
			.contentType(MediaType.APPLICATION_PDF)
			.header(
				HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"aurelia-order-" + id + "-invoice.pdf\""
			)
			.body(invoicePdf);
	}
}
