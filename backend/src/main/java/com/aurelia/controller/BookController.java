package com.aurelia.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.BookRequestDto;
import com.aurelia.dto.BookResponseDto;
import com.aurelia.service.BookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books")
public class BookController {

	private final BookService bookService;

	public BookController(BookService bookService) {
		this.bookService = bookService;
	}

	@GetMapping
	public Page<BookResponseDto> getBooks(
		@RequestParam(required = false, name = "q") String searchTerm,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(defaultValue = "false") boolean inStockOnly,
		@PageableDefault(size = 12, sort = "createdAt") Pageable pageable
	) {
		return bookService.getBooks(searchTerm, categoryId, inStockOnly, pageable);
	}

	@GetMapping("/{id}")
	public BookResponseDto getBook(@PathVariable Long id) {
		return bookService.getBook(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public BookResponseDto createBook(@Valid @RequestBody BookRequestDto request) {
		return bookService.createBook(request);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public BookResponseDto updateBook(
		@PathVariable Long id,
		@Valid @RequestBody BookRequestDto request
	) {
		return bookService.updateBook(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public void deleteBook(@PathVariable Long id) {
		bookService.deleteBook(id);
	}
}
