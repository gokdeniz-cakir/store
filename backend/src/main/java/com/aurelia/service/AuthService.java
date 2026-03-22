package com.aurelia.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.AuthResponseDto;
import com.aurelia.dto.LoginRequestDto;
import com.aurelia.dto.RegisterRequestDto;
import com.aurelia.model.UserRole;
import com.aurelia.repository.UserRepository;
import com.aurelia.security.JwtService;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthService(
		UserRepository userRepository,
		PasswordEncoder passwordEncoder,
		AuthenticationManager authenticationManager,
		JwtService jwtService
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@Transactional
	public AuthResponseDto register(RegisterRequestDto request) {
		String normalizedEmail = normalizeEmail(request.email());

		if (userRepository.existsByEmail(normalizedEmail)) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"An account with this email already exists."
			);
		}

		com.aurelia.model.User user = userRepository.save(com.aurelia.model.User.builder()
			.name(request.name().trim())
			.email(normalizedEmail)
			.passwordHash(passwordEncoder.encode(request.password()))
			.taxId(trimToNull(request.taxId()))
			.homeAddress(trimToNull(request.homeAddress()))
			.role(UserRole.CUSTOMER)
			.build());

		return buildResponse(user.getName(), user.getEmail(), user.getRole(), user.getPasswordHash());
	}

	public AuthResponseDto login(LoginRequestDto request) {
		String normalizedEmail = normalizeEmail(request.email());

		try {
			Authentication authentication = authenticationManager.authenticate(
				UsernamePasswordAuthenticationToken.unauthenticated(
					normalizedEmail,
					request.password()
				)
			);

			User authenticatedUser = (User) authentication.getPrincipal();
			UserRole role = UserRole.valueOf(
				authenticatedUser.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
			);

			return buildResponse(
				lookupName(normalizedEmail),
				authenticatedUser.getUsername(),
				role,
				authenticatedUser.getPassword()
			);
		} catch (AuthenticationException exception) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
		}
	}

	private AuthResponseDto buildResponse(
		String name,
		String email,
		UserRole role,
		String passwordHash
	) {
		UserDetails userDetails = User.builder()
			.username(email)
			.password(passwordHash)
			.authorities("ROLE_" + role.name())
			.build();

		return new AuthResponseDto(
			jwtService.generateToken(userDetails),
			"Bearer",
			name,
			email,
			role.name()
		);
	}

	private String lookupName(String email) {
		return userRepository.findByEmail(email)
			.map(com.aurelia.model.User::getName)
			.orElseThrow(() -> new ResponseStatusException(
				HttpStatus.UNAUTHORIZED,
				"Invalid email or password."
			));
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}

		String trimmedValue = value.trim();
		return trimmedValue.isEmpty() ? null : trimmedValue;
	}
}
