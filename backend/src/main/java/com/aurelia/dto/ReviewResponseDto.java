package com.aurelia.dto;

import java.time.Instant;

public record ReviewResponseDto(
	Long id,
	Long bookId,
	String bookTitle,
	String customerName,
	Short rating,
	String comment,
	boolean approved,
	Instant createdAt
) {
}
