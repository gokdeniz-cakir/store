package com.aurelia.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.ApplyDiscountRequestDto;
import com.aurelia.dto.BookResponseDto;
import com.aurelia.model.Book;
import com.aurelia.model.Wishlist;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.WishlistRepository;

@Service
public class DiscountService {

	private final BookRepository bookRepository;
	private final BookService bookService;
	private final NotificationService notificationService;
	private final WishlistRepository wishlistRepository;

	public DiscountService(
		BookRepository bookRepository,
		BookService bookService,
		NotificationService notificationService,
		WishlistRepository wishlistRepository
	) {
		this.bookRepository = bookRepository;
		this.bookService = bookService;
		this.notificationService = notificationService;
		this.wishlistRepository = wishlistRepository;
	}

	@Transactional
	public List<BookResponseDto> applyDiscount(ApplyDiscountRequestDto request) {
		validateUniqueBookIds(request.bookIds());

		List<Book> books = bookRepository.findAllByIdIn(request.bookIds());

		if (books.size() != request.bookIds().size()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more books could not be found.");
		}

		BigDecimal multiplier = BigDecimal.valueOf(100 - request.percentage())
			.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

		for (Book book : books) {
			BigDecimal basePrice = book.getOriginalPrice() != null ? book.getOriginalPrice() : book.getPrice();
			book.setOriginalPrice(basePrice);
			book.setPrice(basePrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
		}

		List<Book> savedBooks = bookRepository.saveAll(books);
		List<Wishlist> wishlistEntries = wishlistRepository.findAllByBookIdIn(request.bookIds());
		notificationService.createDiscountNotifications(wishlistEntries, request.percentage());

		return savedBooks.stream()
			.map(bookService::mapBook)
			.toList();
	}

	private void validateUniqueBookIds(List<Long> bookIds) {
		Set<Long> uniqueIds = new HashSet<>();

		for (Long bookId : bookIds) {
			if (!uniqueIds.add(bookId)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookIds must not contain duplicates.");
			}
		}
	}
}
