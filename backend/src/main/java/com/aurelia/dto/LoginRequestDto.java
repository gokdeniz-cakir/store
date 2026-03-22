package com.aurelia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
	@NotBlank(message = "email is required")
	@Email(message = "email must be a valid email address")
	String email,

	@NotBlank(message = "password is required")
	String password
) {
}
