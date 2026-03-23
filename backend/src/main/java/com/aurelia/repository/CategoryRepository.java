package com.aurelia.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

	Optional<Category> findByNameIgnoreCase(String name);
}
