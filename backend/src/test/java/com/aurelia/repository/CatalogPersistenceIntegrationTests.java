package com.aurelia.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.aurelia.model.Book;
import com.aurelia.model.Category;
import com.aurelia.repository.CreditCardRepository;
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;

@SpringBootTest
class CatalogPersistenceIntegrationTests {

	@Autowired
	private BookRepository bookRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private CreditCardRepository creditCardRepository;

	@Autowired
	private OrderItemRepository orderItemRepository;

	@Autowired
	private OrderRepository orderRepository;

	@BeforeEach
	void setUp() {
		orderItemRepository.deleteAll();
		orderRepository.deleteAll();
		creditCardRepository.deleteAll();
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
	}

	@Test
	void shouldPersistBookWithCategoryAndVersionField() {
		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Classic Literature")
			.description("Canonical works in fine bindings.")
			.iconName("book-open-text")
			.build());

		Book savedBook = bookRepository.saveAndFlush(Book.builder()
			.title("The Odyssey")
			.author("Homer")
			.isbn("9780140268867")
			.edition("Collector's Edition")
			.description("An epic poem presented in a linen-bound edition.")
			.stockQuantity(12)
			.price(new BigDecimal("89.00"))
			.originalPrice(new BigDecimal("109.00"))
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(560)
			.language("English")
			.publicationYear(2024)
			.coverImageUrl("https://example.com/odyssey.jpg")
			.coverColor("#2F4858")
			.category(category)
			.build());

		assertThat(savedBook.getId()).isNotNull();
		assertThat(savedBook.getVersion()).isZero();
		assertThat(savedBook.getCreatedAt()).isNotNull();
		assertThat(savedBook.getUpdatedAt()).isNotNull();

		Book reloadedBook = bookRepository.findById(savedBook.getId()).orElseThrow();
		Category reloadedCategory = categoryRepository.findById(reloadedBook.getCategory().getId())
			.orElseThrow();

		assertThat(reloadedCategory.getName()).isEqualTo("Classic Literature");
		assertThat(reloadedBook.getPrice()).isEqualByComparingTo("89.00");
		assertThat(reloadedBook.getStockQuantity()).isEqualTo(12);
	}
}
