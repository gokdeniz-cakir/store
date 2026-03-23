package com.aurelia.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
