package com.aurelia.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aurelia.dto.AuthResponseDto;
import com.aurelia.model.User;
import com.aurelia.model.UserRole;
import com.aurelia.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerIntegrationTests {

	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserRepository userRepository;

	@LocalServerPort
	private int port;

	@BeforeEach
	void setUp() {
		userRepository.deleteAll();
	}

	@Test
	void shouldRegisterCustomerAndReturnJwt() throws IOException, InterruptedException {
		HttpResponse<String> response = post(
			"/api/auth/register",
			"""
				{
				  "name": "Rare Reader",
				  "email": "reader@example.com",
				  "password": "collector123",
				  "taxId": "TR-1234567890",
				  "homeAddress": "Pera, Istanbul"
				}
				"""
		);

		assertThat(response.statusCode()).isEqualTo(201);

		AuthResponseDto authResponse = objectMapper.readValue(response.body(), AuthResponseDto.class);
		User storedUser = userRepository.findByEmail("reader@example.com").orElseThrow();

		assertThat(authResponse.token()).isNotBlank();
		assertThat(authResponse.tokenType()).isEqualTo("Bearer");
		assertThat(authResponse.email()).isEqualTo("reader@example.com");
		assertThat(authResponse.role()).isEqualTo("CUSTOMER");
		assertThat(storedUser.getRole()).isEqualTo(UserRole.CUSTOMER);
		assertThat(passwordEncoder.matches("collector123", storedUser.getPasswordHash())).isTrue();
		assertThat(storedUser.getPasswordHash()).isNotEqualTo("collector123");
	}

	@Test
	void shouldRejectDuplicateRegistrationEmail() throws IOException, InterruptedException {
		userRepository.saveAndFlush(User.builder()
			.name("Existing Reader")
			.email("reader@example.com")
			.passwordHash(passwordEncoder.encode("collector123"))
			.role(UserRole.CUSTOMER)
			.build());

		HttpResponse<String> response = post(
			"/api/auth/register",
			"""
				{
				  "name": "Another Reader",
				  "email": "reader@example.com",
				  "password": "collector123"
				}
				"""
		);

		assertThat(response.statusCode()).isEqualTo(409);

		assertThat(objectMapper.readTree(response.body()).get("message").asText())
			.isEqualTo("An account with this email already exists.");
	}

	@Test
	void shouldLoginExistingUserAndReturnJwt() throws IOException, InterruptedException {
		userRepository.saveAndFlush(User.builder()
			.name("Catalog Manager")
			.email("manager@example.com")
			.passwordHash(passwordEncoder.encode("curator123"))
			.role(UserRole.PRODUCT_MANAGER)
			.build());

		HttpResponse<String> response = post(
			"/api/auth/login",
			"""
				{
				  "email": "manager@example.com",
				  "password": "curator123"
				}
				"""
		);

		assertThat(response.statusCode()).isEqualTo(200);

		AuthResponseDto authResponse = objectMapper.readValue(response.body(), AuthResponseDto.class);
		assertThat(authResponse.token()).isNotBlank();
		assertThat(authResponse.email()).isEqualTo("manager@example.com");
		assertThat(authResponse.role()).isEqualTo("PRODUCT_MANAGER");
		assertThat(authResponse.name()).isEqualTo("Catalog Manager");
	}

	@Test
	void shouldRejectInvalidCredentials() throws IOException, InterruptedException {
		userRepository.saveAndFlush(User.builder()
			.name("Sales Manager")
			.email("sales@example.com")
			.passwordHash(passwordEncoder.encode("sales1234"))
			.role(UserRole.SALES_MANAGER)
			.build());

		HttpResponse<String> response = post(
			"/api/auth/login",
			"""
				{
				  "email": "sales@example.com",
				  "password": "wrong-password"
				}
				"""
		);

		assertThat(response.statusCode()).isEqualTo(401);

		assertThat(objectMapper.readTree(response.body()).get("message").asText())
			.isEqualTo("Invalid email or password.");
	}

	private HttpResponse<String> post(String path, String body) throws IOException, InterruptedException {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + path))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();

		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
