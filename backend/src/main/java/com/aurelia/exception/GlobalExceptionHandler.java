package com.aurelia.exception;

import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.ErrorResponseDto;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponseDto> handleValidationException(
		MethodArgumentNotValidException exception,
		HttpServletRequest request
	) {
		String message = exception.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(this::formatFieldError)
			.collect(Collectors.joining("; "));

		return buildErrorResponse(HttpStatus.BAD_REQUEST, message, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(
		IllegalArgumentException exception,
		HttpServletRequest request
	) {
		return buildErrorResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ErrorResponseDto> handleResponseStatusException(
		ResponseStatusException exception,
		HttpServletRequest request
	) {
		String message = exception.getReason() != null
			? exception.getReason()
			: HttpStatus.valueOf(exception.getStatusCode().value()).getReasonPhrase();

		return buildErrorResponse(exception.getStatusCode(), message, request);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponseDto> handleAccessDeniedException(
		AccessDeniedException exception,
		HttpServletRequest request
	) {
		return buildErrorResponse(HttpStatus.FORBIDDEN, "Access is denied.", request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponseDto> handleUnexpectedException(
		Exception exception,
		HttpServletRequest request
	) {
		return buildErrorResponse(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"An unexpected error occurred.",
			request
		);
	}

	private ResponseEntity<ErrorResponseDto> buildErrorResponse(
		HttpStatusCode status,
		String message,
		HttpServletRequest request
	) {
		String error = HttpStatus.valueOf(status.value()).getReasonPhrase();

		return ResponseEntity.status(status)
			.body(new ErrorResponseDto(
				Instant.now(),
				status.value(),
				error,
				message,
				request.getRequestURI()
			));
	}

	private String formatFieldError(FieldError fieldError) {
		String message = fieldError.getDefaultMessage() != null
			? fieldError.getDefaultMessage()
			: "is invalid";

		return fieldError.getField() + ": " + message;
	}
}
