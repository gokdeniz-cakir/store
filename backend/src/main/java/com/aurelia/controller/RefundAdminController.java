package com.aurelia.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.AdminRefundRequestResponseDto;
import com.aurelia.service.RefundAdminService;

@RestController
@RequestMapping("/api/admin/refunds")
@PreAuthorize("hasRole('SALES_MANAGER')")
public class RefundAdminController {

	private final RefundAdminService refundAdminService;

	public RefundAdminController(RefundAdminService refundAdminService) {
		this.refundAdminService = refundAdminService;
	}

	@GetMapping
	public List<AdminRefundRequestResponseDto> getPendingRefunds() {
		return refundAdminService.getPendingRefunds();
	}

	@PatchMapping("/{orderId}/approve")
	public AdminRefundRequestResponseDto approveRefund(@PathVariable Long orderId) {
		return refundAdminService.approveRefund(orderId);
	}

	@PatchMapping("/{orderId}/reject")
	public AdminRefundRequestResponseDto rejectRefund(@PathVariable Long orderId) {
		return refundAdminService.rejectRefund(orderId);
	}
}
