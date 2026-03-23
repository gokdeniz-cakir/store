package com.aurelia.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.ReviewRequestDto;
import com.aurelia.dto.ReviewResponseDto;
import com.aurelia.service.ReviewService;

import jakarta.validation.Valid;

@RestController
public class ReviewController {

	private final ReviewService reviewService;

	public ReviewController(ReviewService reviewService) {
		this.reviewService = reviewService;
	}

	@GetMapping("/api/books/{bookId}/reviews")
	public List<ReviewResponseDto> getApprovedReviews(@PathVariable Long bookId) {
		return reviewService.getApprovedReviews(bookId);
	}

	@PostMapping("/api/books/{bookId}/reviews")
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('CUSTOMER')")
	public ReviewResponseDto createReview(
		@PathVariable Long bookId,
		@Valid @RequestBody ReviewRequestDto request,
		Authentication authentication
	) {
		return reviewService.createReview(bookId, authentication.getName(), request);
	}

	@GetMapping("/api/reviews/pending")
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public List<ReviewResponseDto> getPendingReviews() {
		return reviewService.getPendingReviews();
	}

	@PatchMapping("/api/reviews/{reviewId}/approve")
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public ReviewResponseDto approveReview(@PathVariable Long reviewId) {
		return reviewService.approveReview(reviewId);
	}

	@PatchMapping("/api/reviews/{reviewId}/reject")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public void rejectReview(@PathVariable Long reviewId) {
		reviewService.rejectReview(reviewId);
	}
}
