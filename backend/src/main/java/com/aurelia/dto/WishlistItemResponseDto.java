package com.aurelia.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WishlistItemResponseDto(
	Long id,
	Long bookId,
	String title,
	String author,
	String edition,
	BigDecimal price,
	BigDecimal originalPrice,
	Integer stockQuantity,
	String coverColor,
	CategoryResponseDto category,
	Double averageRating,
	Long reviewCount,
	Instant addedAt
) {
}
