package com.aurelia.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTests {

	private static final String TEST_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
	private static final long TEST_EXPIRATION = 60_000L;

	private final JwtService jwtService = new JwtService(TEST_SECRET, TEST_EXPIRATION);

	@Test
	void shouldGenerateAndParseTokenClaims() {
		UserDetails userDetails = User.builder()
			.username("reader@aurelia.com")
			.password("ignored")
			.authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
			.build();

		String token = jwtService.generateToken(userDetails);

		assertThat(jwtService.extractUsername(token)).isEqualTo("reader@aurelia.com");
		assertThat(jwtService.extractRole(token)).isEqualTo("ROLE_CUSTOMER");
		assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
	}

	@Test
	void shouldRejectTokenForDifferentUser() {
		UserDetails originalUser = User.builder()
			.username("reader@aurelia.com")
			.password("ignored")
			.authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
			.build();
		UserDetails otherUser = User.builder()
			.username("other@aurelia.com")
			.password("ignored")
			.authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
			.build();

		String token = jwtService.generateToken(originalUser);

		assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
	}
}
