package com.aurelia.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.CategoryResponseDto;
import com.aurelia.dto.WishlistItemResponseDto;
import com.aurelia.model.Book;
import com.aurelia.model.User;
import com.aurelia.model.Wishlist;
import com.aurelia.repository.BookRatingSummaryProjection;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.ReviewRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.repository.WishlistRepository;

@Service
public class WishlistService {

	private final BookRepository bookRepository;
	private final ReviewRepository reviewRepository;
	private final UserRepository userRepository;
	private final WishlistRepository wishlistRepository;

	public WishlistService(
		BookRepository bookRepository,
		ReviewRepository reviewRepository,
		UserRepository userRepository,
		WishlistRepository wishlistRepository
	) {
		this.bookRepository = bookRepository;
		this.reviewRepository = reviewRepository;
		this.userRepository = userRepository;
		this.wishlistRepository = wishlistRepository;
	}

	@Transactional(readOnly = true)
	public List<WishlistItemResponseDto> getWishlist(String customerEmail) {
		User customer = findCustomer(customerEmail);
		List<Wishlist> wishlistItems = wishlistRepository.findAllByCustomerIdOrderByAddedAtDesc(customer.getId());
		Map<Long, BookRatingSummaryProjection> ratingsByBookId = loadRatingsByBookId(
			wishlistItems.stream().map(item -> item.getBook().getId()).toList()
		);

		return wishlistItems.stream()
			.map(item -> mapWishlistItem(item, ratingsByBookId.get(item.getBook().getId())))
			.toList();
	}

	@Transactional
	public WishlistItemResponseDto addToWishlist(String customerEmail, Long bookId) {
		User customer = findCustomer(customerEmail);
		Book book = findBook(bookId);

		if (wishlistRepository.existsByCustomerIdAndBookId(customer.getId(), bookId)) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"This book is already in your wishlist."
			);
		}

		Wishlist wishlist = wishlistRepository.saveAndFlush(Wishlist.builder()
			.customer(customer)
			.book(book)
			.build());
		BookRatingSummaryProjection ratingSummary = loadRatingsByBookId(List.of(bookId)).get(bookId);

		return mapWishlistItem(wishlist, ratingSummary);
	}

	@Transactional
	public void removeFromWishlist(String customerEmail, Long bookId) {
		User customer = findCustomer(customerEmail);

		if (!wishlistRepository.existsByCustomerIdAndBookId(customer.getId(), bookId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Wishlist item not found.");
		}

		wishlistRepository.deleteByCustomerIdAndBookId(customer.getId(), bookId);
	}

	private Book findBook(Long bookId) {
		return bookRepository.findWithCategoryById(bookId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found."));
	}

	private User findCustomer(String customerEmail) {
		return userRepository.findByEmail(customerEmail.trim().toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer not found."));
	}

	private Map<Long, BookRatingSummaryProjection> loadRatingsByBookId(List<Long> bookIds) {
		if (bookIds.isEmpty()) {
			return Map.of();
		}

		return reviewRepository.summarizeApprovedRatingsByBookIds(bookIds).stream()
			.collect(Collectors.toMap(BookRatingSummaryProjection::getBookId, Function.identity()));
	}

	private WishlistItemResponseDto mapWishlistItem(
		Wishlist wishlist,
		BookRatingSummaryProjection ratingSummary
	) {
		Book book = wishlist.getBook();

		return new WishlistItemResponseDto(
			wishlist.getId(),
			book.getId(),
			book.getTitle(),
			book.getAuthor(),
			book.getEdition(),
			book.getPrice(),
			book.getOriginalPrice(),
			book.getStockQuantity(),
			book.getCoverColor(),
			new CategoryResponseDto(
				book.getCategory().getId(),
				book.getCategory().getName(),
				book.getCategory().getDescription(),
				book.getCategory().getIconName()
			),
			ratingSummary != null ? ratingSummary.getAverageRating() : 0.0,
			ratingSummary != null ? ratingSummary.getReviewCount() : 0L,
			wishlist.getAddedAt()
		);
	}
}
