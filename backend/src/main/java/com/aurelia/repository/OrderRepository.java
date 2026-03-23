package com.aurelia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

	List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
