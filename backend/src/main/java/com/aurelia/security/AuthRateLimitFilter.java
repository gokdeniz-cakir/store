package com.aurelia.security;

import java.io.IOException;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

	private final AuthRateLimitService authRateLimitService;
	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	public AuthRateLimitFilter(AuthRateLimitService authRateLimitService) {
		this.authRateLimitService = authRateLimitService;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String requestUri = request.getRequestURI();
		return !("POST".equalsIgnoreCase(request.getMethod())
			&& ("/api/auth/login".equals(requestUri) || "/api/auth/register".equals(requestUri)));
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String rateLimitKey = request.getRemoteAddr() + ":" + request.getRequestURI();

		if (!authRateLimitService.tryConsume(rateLimitKey)) {
			response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			objectMapper.writeValue(
				response.getWriter(),
				java.util.Map.of(
					"timestamp", Instant.now().toString(),
					"status", HttpStatus.TOO_MANY_REQUESTS.value(),
					"error", HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
					"message", "Too many authentication attempts. Please wait and try again.",
					"path", request.getRequestURI()
				)
			);
			return;
		}

		filterChain.doFilter(request, response);
	}
}
