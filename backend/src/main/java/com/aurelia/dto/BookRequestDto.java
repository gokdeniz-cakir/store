package com.aurelia.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record BookRequestDto(
	@NotBlank(message = "title is required")
	@Size(max = 255, message = "title must be 255 characters or fewer")
	String title,

	@NotBlank(message = "author is required")
	@Size(max = 255, message = "author must be 255 characters or fewer")
	String author,

	@NotBlank(message = "isbn is required")
	@Size(min = 13, max = 13, message = "isbn must be 13 characters")
	@Pattern(regexp = "\\d{13}", message = "isbn must contain 13 digits")
	String isbn,

	@NotBlank(message = "edition is required")
	@Size(max = 255, message = "edition must be 255 characters or fewer")
	String edition,

	@Size(max = 5000, message = "description must be 5000 characters or fewer")
	String description,

	@NotNull(message = "stockQuantity is required")
	@PositiveOrZero(message = "stockQuantity must be zero or greater")
	Integer stockQuantity,

	@NotNull(message = "price is required")
	@DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than zero")
	@Digits(integer = 10, fraction = 2, message = "price must have up to 2 decimal places")
	BigDecimal price,

	@DecimalMin(value = "0.0", inclusive = false, message = "originalPrice must be greater than zero")
	@Digits(integer = 10, fraction = 2, message = "originalPrice must have up to 2 decimal places")
	BigDecimal originalPrice,

	@Size(max = 255, message = "returnPolicy must be 255 characters or fewer")
	String returnPolicy,

	@NotBlank(message = "publisher is required")
	@Size(max = 255, message = "publisher must be 255 characters or fewer")
	String publisher,

	@Positive(message = "pageCount must be greater than zero")
	Integer pageCount,

	@Size(max = 64, message = "language must be 64 characters or fewer")
	String language,

	Integer publicationYear,

	@Size(max = 500, message = "coverImageUrl must be 500 characters or fewer")
	String coverImageUrl,

	@NotBlank(message = "coverColor is required")
	@Size(min = 7, max = 7, message = "coverColor must be a 7-character hex value")
	@Pattern(regexp = "#[0-9A-Fa-f]{6}", message = "coverColor must be a valid hex color")
	String coverColor,

	@NotNull(message = "categoryId is required")
	Long categoryId
) {
}
