package com.aurelia.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aurelia.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

	@EntityGraph(attributePaths = {"book", "customer"})
	Optional<Review> findWithBookAndCustomerById(Long id);

	@EntityGraph(attributePaths = {"book", "customer"})
	List<Review> findAllByBookIdAndApprovedTrueOrderByCreatedAtDesc(Long bookId);

	@EntityGraph(attributePaths = {"book", "customer"})
	List<Review> findAllByApprovedFalseOrderByCreatedAtAsc();

	@Query("""
		select review.book.id as bookId,
			avg(review.rating) as averageRating,
			count(review.id) as reviewCount
		from Review review
		where review.approved = true
			and review.book.id in :bookIds
		group by review.book.id
		""")
	List<BookRatingSummaryProjection> summarizeApprovedRatingsByBookIds(
		@Param("bookIds") Collection<Long> bookIds
	);

	boolean existsByBookIdAndCustomerId(Long bookId, Long customerId);
}
