package com.aurelia.dto;

import java.time.Instant;

public record NotificationResponseDto(
	Long id,
	Long bookId,
	String bookTitle,
	String message,
	boolean read,
	Instant createdAt
) {
}
