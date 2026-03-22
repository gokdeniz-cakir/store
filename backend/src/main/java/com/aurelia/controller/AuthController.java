package com.aurelia.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.AuthResponseDto;
import com.aurelia.dto.LoginRequestDto;
import com.aurelia.dto.RegisterRequestDto;
import com.aurelia.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public AuthResponseDto login(@Valid @RequestBody LoginRequestDto request) {
		return authService.login(request);
	}
}
