package com.aurelia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequestDto(
	@NotBlank(message = "name is required")
	@Size(max = 255, message = "name must be 255 characters or fewer")
	String name,

	@Size(max = 2000, message = "description must be 2000 characters or fewer")
	String description,

	@NotBlank(message = "iconName is required")
	@Size(max = 100, message = "iconName must be 100 characters or fewer")
	String iconName
) {
}
