package com.aurelia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDto(
	@NotBlank(message = "name is required")
	@Size(max = 255, message = "name must be 255 characters or fewer")
	String name,

	@NotBlank(message = "email is required")
	@Email(message = "email must be a valid email address")
	@Size(max = 255, message = "email must be 255 characters or fewer")
	String email,

	@NotBlank(message = "password is required")
	@Size(min = 8, message = "password must be at least 8 characters")
	@Size(max = 255, message = "password must be 255 characters or fewer")
	String password,

	@Size(max = 64, message = "taxId must be 64 characters or fewer")
	String taxId,

	@Size(max = 1000, message = "homeAddress must be 1000 characters or fewer")
	String homeAddress
) {
}
