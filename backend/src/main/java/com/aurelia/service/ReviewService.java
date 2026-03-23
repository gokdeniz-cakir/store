package com.aurelia.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.ReviewRequestDto;
import com.aurelia.dto.ReviewResponseDto;
import com.aurelia.model.Book;
import com.aurelia.model.Review;
import com.aurelia.model.User;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.ReviewRepository;
import com.aurelia.repository.UserRepository;

@Service
public class ReviewService {

	private final BookRepository bookRepository;
	private final ReviewRepository reviewRepository;
	private final UserRepository userRepository;

	public ReviewService(
		BookRepository bookRepository,
		ReviewRepository reviewRepository,
		UserRepository userRepository
	) {
		this.bookRepository = bookRepository;
		this.reviewRepository = reviewRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public ReviewResponseDto createReview(Long bookId, String customerEmail, ReviewRequestDto request) {
		User customer = findCustomer(customerEmail);
		Book book = findBook(bookId);

		if (reviewRepository.existsByBookIdAndCustomerId(bookId, customer.getId())) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"You have already reviewed this book."
			);
		}

		Review review = reviewRepository.saveAndFlush(Review.builder()
			.book(book)
			.customer(customer)
			.rating(request.rating())
			.comment(trimToNull(request.comment()))
			.approved(false)
			.build());

		return mapReview(review);
	}

	@Transactional(readOnly = true)
	public List<ReviewResponseDto> getApprovedReviews(Long bookId) {
		findBook(bookId);
		return reviewRepository.findAllByBookIdAndApprovedTrueOrderByCreatedAtDesc(bookId)
			.stream()
			.map(this::mapReview)
			.toList();
	}

	@Transactional(readOnly = true)
	public List<ReviewResponseDto> getPendingReviews() {
		return reviewRepository.findAllByApprovedFalseOrderByCreatedAtAsc()
			.stream()
			.map(this::mapReview)
			.toList();
	}

	@Transactional
	public ReviewResponseDto approveReview(Long reviewId) {
		Review review = findReview(reviewId);
		review.setApproved(true);
		return mapReview(reviewRepository.save(review));
	}

	@Transactional
	public void rejectReview(Long reviewId) {
		reviewRepository.delete(findReview(reviewId));
	}

	private Book findBook(Long bookId) {
		return bookRepository.findWithCategoryById(bookId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found."));
	}

	private User findCustomer(String customerEmail) {
		return userRepository.findByEmail(customerEmail.trim().toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer not found."));
	}

	private Review findReview(Long reviewId) {
		return reviewRepository.findWithBookAndCustomerById(reviewId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found."));
	}

	private ReviewResponseDto mapReview(Review review) {
		return new ReviewResponseDto(
			review.getId(),
			review.getBook().getId(),
			review.getBook().getTitle(),
			review.getCustomer().getName(),
			review.getRating(),
			review.getComment(),
			review.isApproved(),
			review.getCreatedAt()
		);
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}

		String trimmedValue = value.trim();
		return trimmedValue.isEmpty() ? null : trimmedValue;
	}
}
