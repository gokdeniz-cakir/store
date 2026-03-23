package com.aurelia.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.BookRequestDto;
import com.aurelia.dto.BookResponseDto;
import com.aurelia.dto.CategoryResponseDto;
import com.aurelia.model.Book;
import com.aurelia.model.Category;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.BookRatingSummaryProjection;
import com.aurelia.repository.CategoryRepository;
import com.aurelia.repository.ReviewRepository;

@Service
public class BookService {

	private final BookRepository bookRepository;
	private final CategoryRepository categoryRepository;
	private final ReviewRepository reviewRepository;

	public BookService(
		BookRepository bookRepository,
		CategoryRepository categoryRepository,
		ReviewRepository reviewRepository
	) {
		this.bookRepository = bookRepository;
		this.categoryRepository = categoryRepository;
		this.reviewRepository = reviewRepository;
	}

	@Transactional(readOnly = true)
	public Page<BookResponseDto> getBooks(
		String searchTerm,
		Long categoryId,
		boolean inStockOnly,
		Pageable pageable
	) {
		String normalizedSearchTerm = normalizeSearchTerm(searchTerm);
		Pageable normalizedPageable = normalizePageable(pageable);
		Page<Book> books = isPopularitySort(pageable)
			? bookRepository.searchCatalogOrderByPopularity(
				normalizedSearchTerm,
				categoryId,
				inStockOnly,
				normalizedPageable
			)
			: bookRepository.searchCatalog(
				normalizedSearchTerm,
				categoryId,
				inStockOnly,
				normalizedPageable
			);
		Map<Long, BookRatingSummaryProjection> ratingsByBookId = loadRatingsByBookId(
			books.getContent().stream().map(Book::getId).toList()
		);

		List<BookResponseDto> content = books.getContent()
			.stream()
			.map(book -> mapBook(book, ratingsByBookId.get(book.getId())))
			.toList();

		return new PageImpl<>(content, normalizedPageable, books.getTotalElements());
	}

	@Transactional(readOnly = true)
	public BookResponseDto getBook(Long id) {
		Book book = findBook(id);
		return mapBook(book, loadRatingsByBookId(List.of(id)).get(id));
	}

	@Transactional
	public BookResponseDto createBook(BookRequestDto request) {
		validateIsbnUniqueness(request.isbn(), null);

		Book book = bookRepository.save(buildBook(request, Book.builder()).build());
		return mapBook(findBook(book.getId()));
	}

	@Transactional
	public BookResponseDto updateBook(Long id, BookRequestDto request) {
		Book existingBook = findBook(id);
		validateIsbnUniqueness(request.isbn(), id);

		Book updatedBook = buildBook(request, Book.builder()
			.id(existingBook.getId())
			.createdAt(existingBook.getCreatedAt())
			.updatedAt(existingBook.getUpdatedAt())
			.version(existingBook.getVersion()))
			.build();

		return mapBook(bookRepository.save(updatedBook));
	}

	@Transactional
	public void deleteBook(Long id) {
		Book book = findBook(id);
		bookRepository.delete(book);
	}

	private Book findBook(Long id) {
		return bookRepository.findWithCategoryById(id)
			.orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND,
				"Book not found."
			));
	}

	private Category findCategory(Long id) {
		return categoryRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND,
				"Category not found."
			));
	}

	private Book.BookBuilder buildBook(BookRequestDto request, Book.BookBuilder builder) {
		return builder
			.title(request.title().trim())
			.author(request.author().trim())
			.isbn(request.isbn().trim())
			.edition(request.edition().trim())
			.description(trimToNull(request.description()))
			.stockQuantity(request.stockQuantity())
			.price(request.price())
			.originalPrice(request.originalPrice())
			.returnPolicy(trimToNull(request.returnPolicy()))
			.publisher(request.publisher().trim())
			.pageCount(request.pageCount())
			.language(trimToNull(request.language()))
			.publicationYear(request.publicationYear())
			.coverImageUrl(trimToNull(request.coverImageUrl()))
			.coverColor(request.coverColor().trim())
			.category(findCategory(request.categoryId()));
	}

	private void validateIsbnUniqueness(String isbn, Long existingBookId) {
		String normalizedIsbn = isbn.trim();
		boolean isbnExists = existingBookId == null
			? bookRepository.existsByIsbn(normalizedIsbn)
			: bookRepository.existsByIsbnAndIdNot(normalizedIsbn, existingBookId);

		if (isbnExists) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"A book with this ISBN already exists."
			);
		}
	}

	private Pageable normalizePageable(Pageable pageable) {
		List<Sort.Order> orders = new ArrayList<>();

		if (pageable.getSort().isUnsorted()) {
			orders.add(Sort.Order.desc("createdAt"));
		} else {
			for (Sort.Order order : pageable.getSort()) {
				orders.add(mapSortOrder(order));
			}
		}

		return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
	}

	private Sort.Order mapSortOrder(Sort.Order order) {
		return switch (order.getProperty()) {
			case "price", "title", "createdAt" -> order;
			case "popularity" -> new Sort.Order(order.getDirection(), "createdAt");
			default -> throw new IllegalArgumentException("Unsupported sort property: " + order.getProperty());
		};
	}

	private boolean isPopularitySort(Pageable pageable) {
		return pageable.getSort().stream()
			.anyMatch(order -> "popularity".equals(order.getProperty()));
	}

	private String normalizeSearchTerm(String searchTerm) {
		if (searchTerm == null) {
			return "";
		}

		String trimmedSearchTerm = searchTerm.trim();
		return trimmedSearchTerm.isEmpty() ? "" : trimmedSearchTerm;
	}

	private Map<Long, BookRatingSummaryProjection> loadRatingsByBookId(List<Long> bookIds) {
		if (bookIds.isEmpty()) {
			return Map.of();
		}

		return reviewRepository.summarizeApprovedRatingsByBookIds(bookIds).stream()
			.collect(Collectors.toMap(BookRatingSummaryProjection::getBookId, Function.identity()));
	}

	public BookResponseDto mapBook(Book book) {
		return mapBook(book, loadRatingsByBookId(List.of(book.getId())).get(book.getId()));
	}

	private BookResponseDto mapBook(Book book, BookRatingSummaryProjection ratingSummary) {
		Category category = book.getCategory();

		return new BookResponseDto(
			book.getId(),
			book.getTitle(),
			book.getAuthor(),
			book.getIsbn(),
			book.getEdition(),
			book.getDescription(),
			book.getStockQuantity(),
			book.getPrice(),
			book.getOriginalPrice(),
			book.getReturnPolicy(),
			book.getPublisher(),
			book.getPageCount(),
			book.getLanguage(),
			book.getPublicationYear(),
			book.getCoverImageUrl(),
			book.getCoverColor(),
			new CategoryResponseDto(
				category.getId(),
				category.getName(),
				category.getDescription(),
				category.getIconName()
			),
			ratingSummary != null ? ratingSummary.getAverageRating() : 0.0,
			ratingSummary != null ? ratingSummary.getReviewCount() : 0L,
			book.getCreatedAt(),
			book.getUpdatedAt(),
			book.getVersion()
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
