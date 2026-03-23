package com.aurelia.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
}
