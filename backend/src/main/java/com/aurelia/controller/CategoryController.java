package com.aurelia.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.CategoryRequestDto;
import com.aurelia.dto.CategoryResponseDto;
import com.aurelia.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final CategoryService categoryService;

	public CategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping
	public List<CategoryResponseDto> getCategories() {
		return categoryService.getAllCategories();
	}

	@GetMapping("/{id}")
	public CategoryResponseDto getCategory(@PathVariable Long id) {
		return categoryService.getCategory(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public CategoryResponseDto createCategory(@Valid @RequestBody CategoryRequestDto request) {
		return categoryService.createCategory(request);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public CategoryResponseDto updateCategory(
		@PathVariable Long id,
		@Valid @RequestBody CategoryRequestDto request
	) {
		return categoryService.updateCategory(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("hasRole('PRODUCT_MANAGER')")
	public void deleteCategory(@PathVariable Long id) {
		categoryService.deleteCategory(id);
	}
}
