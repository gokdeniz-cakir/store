package com.aurelia.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
