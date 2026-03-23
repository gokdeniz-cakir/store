package com.aurelia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

	@EntityGraph(attributePaths = {"order", "order.customer", "book", "book.category"})
	List<OrderItem> findAllByOrderByOrderCreatedAtDescIdDesc();

	@EntityGraph(attributePaths = {"order", "order.customer", "book", "book.category"})
	Optional<OrderItem> findWithOrderAndCustomerById(Long id);
}
