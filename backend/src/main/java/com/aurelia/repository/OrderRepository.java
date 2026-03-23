package com.aurelia.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@EntityGraph(attributePaths = {"items", "items.book", "items.book.category"})
	Page<Order> findByCustomerId(Long customerId, Pageable pageable);

	@EntityGraph(attributePaths = {"items", "items.book", "items.book.category"})
	Optional<Order> findByIdAndCustomerId(Long id, Long customerId);
}
