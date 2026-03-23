package com.aurelia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.AdminDeliveryResponseDto;
import com.aurelia.dto.UpdateDeliveryStatusRequestDto;
import com.aurelia.service.DeliveryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/deliveries")
@PreAuthorize("hasRole('PRODUCT_MANAGER')")
public class DeliveryController {

	private final DeliveryService deliveryService;

	public DeliveryController(DeliveryService deliveryService) {
		this.deliveryService = deliveryService;
	}

	@GetMapping
	public List<AdminDeliveryResponseDto> getDeliveries() {
		return deliveryService.getDeliveries();
	}

	@PatchMapping("/{id}/status")
	public AdminDeliveryResponseDto updateDeliveryStatus(
		@PathVariable Long id,
		@Valid @RequestBody UpdateDeliveryStatusRequestDto request
	) {
		return deliveryService.updateDeliveryStatus(id, request.status());
	}
}
