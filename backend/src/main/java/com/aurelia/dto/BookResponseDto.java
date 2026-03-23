package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BookResponseDto(
	Long id,
	String title,
	String author,
	String isbn,
	String edition,
	String description,
	Integer stockQuantity,
	BigDecimal price,
	BigDecimal originalPrice,
	String returnPolicy,
	String publisher,
	Integer pageCount,
	String language,
	Integer publicationYear,
	String coverImageUrl,
	String coverColor,
	CategoryResponseDto category,
	Instant createdAt,
	Instant updatedAt,
	Long version
) {
}
