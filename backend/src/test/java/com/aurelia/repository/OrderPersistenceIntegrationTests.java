package com.aurelia.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.aurelia.model.Book;
import com.aurelia.model.Category;
import com.aurelia.model.CreditCard;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.model.User;
import com.aurelia.model.UserRole;

@SpringBootTest
class OrderPersistenceIntegrationTests {

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
	private UserRepository userRepository;

	@BeforeEach
	void setUp() {
		orderItemRepository.deleteAll();
		orderRepository.deleteAll();
		creditCardRepository.deleteAll();
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteByEmailIn(java.util.List.of("orders-test@example.com"));
	}

	@Test
	void shouldPersistOrderItemsAndEncryptedCreditCard() {
		User customer = userRepository.saveAndFlush(User.builder()
			.name("Order Test Customer")
			.email("orders-test@example.com")
			.passwordHash("hashed-password")
			.role(UserRole.CUSTOMER)
			.homeAddress("12 Aurelia Lane")
			.build());

		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Order Test Category")
			.description("Category for order persistence testing.")
			.iconName("BookOpen")
			.build());

		Book book = bookRepository.saveAndFlush(Book.builder()
			.title("Order Test Book")
			.author("Aurelia Author")
			.isbn("9780306400099")
			.edition("Hardcover")
			.description("Order persistence test book.")
			.stockQuantity(6)
			.price(new BigDecimal("49.00"))
			.publisher("Aurelia Editions")
			.pageCount(320)
			.language("English")
			.publicationYear(2024)
			.coverColor("#5C1717")
			.category(category)
			.build());

		Order order = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(new BigDecimal("98.00"))
			.status(OrderStatus.PROCESSING)
			.shippingAddress("12 Aurelia Lane")
			.build());

		OrderItem savedOrderItem = orderItemRepository.saveAndFlush(OrderItem.builder()
			.order(order)
			.book(book)
			.quantity(2)
			.unitPrice(new BigDecimal("49.00"))
			.discountApplied(BigDecimal.ZERO)
			.build());

		CreditCard savedCreditCard = creditCardRepository.saveAndFlush(CreditCard.builder()
			.customer(customer)
			.cardNumberEncrypted("encrypted-card-number")
			.cardholderName("Order Test Customer")
			.expiryMonth((short) 12)
			.expiryYear(2030)
			.build());

		assertThat(order.getId()).isNotNull();
		assertThat(order.getCreatedAt()).isNotNull();
		assertThat(savedOrderItem.getId()).isNotNull();
		assertThat(savedCreditCard.getId()).isNotNull();

		Order reloadedOrder = orderRepository.findById(order.getId()).orElseThrow();
		OrderItem reloadedOrderItem = orderItemRepository.findById(savedOrderItem.getId()).orElseThrow();
		CreditCard reloadedCreditCard = creditCardRepository.findById(savedCreditCard.getId())
			.orElseThrow();

		assertThat(reloadedOrder.getStatus()).isEqualTo(OrderStatus.PROCESSING);
		assertThat(reloadedOrder.getTotalPrice()).isEqualByComparingTo("98.00");
		assertThat(reloadedOrderItem.getQuantity()).isEqualTo(2);
		assertThat(reloadedOrderItem.getBook().getId()).isEqualTo(book.getId());
		assertThat(reloadedCreditCard.getCardNumberEncrypted()).isEqualTo("encrypted-card-number");
	}
}
