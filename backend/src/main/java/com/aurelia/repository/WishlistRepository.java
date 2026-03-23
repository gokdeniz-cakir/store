package com.aurelia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.aurelia.model.Wishlist;

import jakarta.transaction.Transactional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

	@EntityGraph(attributePaths = {"book", "book.category", "customer"})
	List<Wishlist> findAllByCustomerIdOrderByAddedAtDesc(Long customerId);

	Optional<Wishlist> findByCustomerIdAndBookId(Long customerId, Long bookId);

	boolean existsByCustomerIdAndBookId(Long customerId, Long bookId);

	@Modifying
	@Transactional
	void deleteByCustomerIdAndBookId(Long customerId, Long bookId);
}
