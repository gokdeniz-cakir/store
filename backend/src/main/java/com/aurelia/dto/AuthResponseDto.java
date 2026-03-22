package com.aurelia.dto;

public record AuthResponseDto(
	String token,
	String tokenType,
	String name,
	String email,
	String role
) {
}
