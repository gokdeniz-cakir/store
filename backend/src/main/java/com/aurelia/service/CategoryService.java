package com.aurelia.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.CategoryRequestDto;
import com.aurelia.dto.CategoryResponseDto;
import com.aurelia.model.Category;
import com.aurelia.repository.CategoryRepository;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;

	public CategoryService(CategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponseDto> getAllCategories() {
		return categoryRepository.findAll()
			.stream()
			.map(this::mapCategory)
			.toList();
	}

	@Transactional(readOnly = true)
	public CategoryResponseDto getCategory(Long id) {
		return mapCategory(findCategory(id));
	}

	@Transactional
	public CategoryResponseDto createCategory(CategoryRequestDto request) {
		String normalizedName = request.name().trim();

		if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"A category with this name already exists."
			);
		}

		Category category = categoryRepository.save(Category.builder()
			.name(normalizedName)
			.description(trimToNull(request.description()))
			.iconName(request.iconName().trim())
			.build());

		return mapCategory(category);
	}

	@Transactional
	public CategoryResponseDto updateCategory(Long id, CategoryRequestDto request) {
		Category category = findCategory(id);
		String normalizedName = request.name().trim();

		if (categoryRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, id)) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"A category with this name already exists."
			);
		}

		category.setName(normalizedName);
		category.setDescription(trimToNull(request.description()));
		category.setIconName(request.iconName().trim());

		return mapCategory(categoryRepository.save(category));
	}

	@Transactional
	public void deleteCategory(Long id) {
		Category category = findCategory(id);
		categoryRepository.delete(category);
	}

	private Category findCategory(Long id) {
		return categoryRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND,
				"Category not found."
			));
	}

	private CategoryResponseDto mapCategory(Category category) {
		return new CategoryResponseDto(
			category.getId(),
			category.getName(),
			category.getDescription(),
			category.getIconName()
		);
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}

		String trimmedValue = value.trim();
		return trimmedValue.isEmpty() ? null : trimmedValue;
	}
}
