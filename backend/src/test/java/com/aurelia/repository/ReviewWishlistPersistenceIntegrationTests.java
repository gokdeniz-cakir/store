package com.aurelia.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import com.aurelia.model.Book;
import com.aurelia.model.Category;
import com.aurelia.model.Review;
import com.aurelia.model.User;
import com.aurelia.model.UserRole;
import com.aurelia.model.Wishlist;

@SpringBootTest
class ReviewWishlistPersistenceIntegrationTests {

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

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WishlistRepository wishlistRepository;

	@BeforeEach
	void setUp() {
		reviewRepository.deleteAll();
		wishlistRepository.deleteAll();
		orderItemRepository.deleteAll();
		orderRepository.deleteAll();
		creditCardRepository.deleteAll();
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteByEmailIn(java.util.List.of("reviews-test@example.com"));
	}

	@Test
	void shouldPersistReviewsAndWishlistEntriesAndRejectDuplicates() {
		User customer = userRepository.saveAndFlush(User.builder()
			.name("Review Test Customer")
			.email("reviews-test@example.com")
			.passwordHash("hashed-password")
			.role(UserRole.CUSTOMER)
			.build());

		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Review Test Category")
			.description("Category for review persistence testing.")
			.iconName("BookOpen")
			.build());

		Book book = bookRepository.saveAndFlush(Book.builder()
			.title("Review Test Book")
			.author("Aurelia Author")
			.isbn("9780306400199")
			.edition("Linen Edition")
			.description("Review persistence test book.")
			.stockQuantity(9)
			.price(new BigDecimal("58.00"))
			.publisher("Aurelia Editions")
			.pageCount(240)
			.language("English")
			.publicationYear(2024)
			.coverColor("#5C1717")
			.category(category)
			.build());

		Review savedReview = reviewRepository.saveAndFlush(Review.builder()
			.book(book)
			.customer(customer)
			.rating((short) 5)
			.comment("A striking edition with elegant production details.")
			.approved(false)
			.build());

		Wishlist savedWishlist = wishlistRepository.saveAndFlush(Wishlist.builder()
			.book(book)
			.customer(customer)
			.build());

		assertThat(savedReview.getId()).isNotNull();
		assertThat(savedReview.getCreatedAt()).isNotNull();
		assertThat(savedWishlist.getId()).isNotNull();
		assertThat(savedWishlist.getAddedAt()).isNotNull();
		assertThat(reviewRepository.existsByBookIdAndCustomerId(book.getId(), customer.getId())).isTrue();
		assertThat(wishlistRepository.existsByCustomerIdAndBookId(customer.getId(), book.getId())).isTrue();

		assertThatThrownBy(() -> reviewRepository.saveAndFlush(Review.builder()
			.book(book)
			.customer(customer)
			.rating((short) 4)
			.comment("Duplicate review.")
			.approved(false)
			.build()))
			.isInstanceOf(DataIntegrityViolationException.class);

		assertThatThrownBy(() -> wishlistRepository.saveAndFlush(Wishlist.builder()
			.book(book)
			.customer(customer)
			.build()))
			.isInstanceOf(DataIntegrityViolationException.class);
	}
}
