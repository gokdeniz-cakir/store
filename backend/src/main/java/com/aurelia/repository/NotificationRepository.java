package com.aurelia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

	@EntityGraph(attributePaths = {"book", "customer"})
	List<Notification> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);

	@EntityGraph(attributePaths = {"book", "customer"})
	Optional<Notification> findByIdAndCustomerId(Long id, Long customerId);
}
