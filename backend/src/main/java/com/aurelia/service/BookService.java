package com.aurelia.service;

import java.util.ArrayList;
import java.util.List;

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
import com.aurelia.repository.CategoryRepository;

@Service
public class BookService {

	private final BookRepository bookRepository;
	private final CategoryRepository categoryRepository;

	public BookService(
		BookRepository bookRepository,
		CategoryRepository categoryRepository
	) {
		this.bookRepository = bookRepository;
		this.categoryRepository = categoryRepository;
	}

	@Transactional(readOnly = true)
	public Page<BookResponseDto> getBooks(
		String searchTerm,
		Long categoryId,
		boolean inStockOnly,
		Pageable pageable
	) {
		Pageable normalizedPageable = normalizePageable(pageable);
		Page<Book> books = bookRepository.searchCatalog(
			normalizeSearchTerm(searchTerm),
			categoryId,
			inStockOnly,
			normalizedPageable
		);

		List<BookResponseDto> content = books.getContent()
			.stream()
			.map(this::mapBook)
			.toList();

		return new PageImpl<>(content, normalizedPageable, books.getTotalElements());
	}

	@Transactional(readOnly = true)
	public BookResponseDto getBook(Long id) {
		return mapBook(findBook(id));
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

	private String normalizeSearchTerm(String searchTerm) {
		if (searchTerm == null) {
			return null;
		}

		String trimmedSearchTerm = searchTerm.trim();
		return trimmedSearchTerm.isEmpty() ? null : trimmedSearchTerm;
	}

	private BookResponseDto mapBook(Book book) {
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
