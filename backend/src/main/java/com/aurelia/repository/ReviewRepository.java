package com.aurelia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

	@EntityGraph(attributePaths = {"book", "customer"})
	Optional<Review> findWithBookAndCustomerById(Long id);

	@EntityGraph(attributePaths = {"book", "customer"})
	List<Review> findAllByBookIdAndApprovedTrueOrderByCreatedAtDesc(Long bookId);

	@EntityGraph(attributePaths = {"book", "customer"})
	List<Review> findAllByApprovedFalseOrderByCreatedAtAsc();

	boolean existsByBookIdAndCustomerId(Long bookId, Long customerId);
}
