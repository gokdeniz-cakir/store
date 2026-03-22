package com.aurelia.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.model.User;
import com.aurelia.model.UserRole;
import com.aurelia.repository.UserRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(SecurityIntegrationTests.SecurityProbeConfiguration.class)
class SecurityIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of("auth@example.com");

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserRepository userRepository;

	@LocalServerPort
	private int port;

	@BeforeEach
	void setUp() {
		userRepository.deleteByEmailIn(TEST_EMAILS);
	}

	@Test
	void shouldRejectUnauthenticatedAccessToProtectedEndpoint() throws IOException, InterruptedException {
		HttpResponse<String> response = sendRequest(null);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	@Test
	void shouldAllowAuthenticatedAccessToProtectedEndpoint() throws IOException, InterruptedException {
		User user = userRepository.saveAndFlush(User.builder()
			.name("Auth User")
			.email("auth@example.com")
			.passwordHash("ignored")
			.role(UserRole.CUSTOMER)
			.build());

		String token = jwtService.generateToken(
			org.springframework.security.core.userdetails.User.builder()
				.username(user.getEmail())
				.password(user.getPasswordHash())
				.authorities("ROLE_" + user.getRole().name())
				.build()
		);

		HttpResponse<String> response = sendRequest(token);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("auth@example.com");
	}

	private HttpResponse<String> sendRequest(String token) throws IOException, InterruptedException {
		HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + "/api/security/probe"))
			.GET();

		if (token != null) {
			requestBuilder.header("Authorization", "Bearer " + token);
		}

		return HttpClient.newHttpClient()
			.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
	}

	@TestConfiguration
	static class SecurityProbeConfiguration {

		@Bean
		SecurityProbeController securityProbeController() {
			return new SecurityProbeController();
		}
	}

	@RestController
	@RequestMapping("/api/security")
	static class SecurityProbeController {

		@GetMapping("/probe")
		ResponseEntity<String> probe(org.springframework.security.core.Authentication authentication) {
			return ResponseEntity.ok(authentication.getName());
		}
	}
}
