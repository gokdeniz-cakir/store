package com.aurelia.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aurelia.model.Book;
import com.aurelia.model.Category;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.model.UserRole;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.CategoryRepository;
import com.aurelia.repository.CreditCardRepository;
import com.aurelia.repository.NotificationRepository;
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;
import com.aurelia.repository.ReviewRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.repository.WishlistRepository;
import com.aurelia.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RefundAdminControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"refund-customer@example.com",
		"refund-sales@example.com",
		"refund-product@example.com"
	);

	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	@Autowired
	private BookRepository bookRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private CreditCardRepository creditCardRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private NotificationRepository notificationRepository;

	@Autowired
	private OrderItemRepository orderItemRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WishlistRepository wishlistRepository;

	@LocalServerPort
	private int port;

	@BeforeEach
	void setUp() {
		notificationRepository.deleteAll();
		reviewRepository.deleteAll();
		wishlistRepository.deleteAll();
		orderItemRepository.deleteAll();
		orderRepository.deleteAll();
		creditCardRepository.deleteAll();
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteByEmailIn(TEST_EMAILS);
	}

	@Test
	void shouldListPendingRefundRequestsForSalesManager() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("refund-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Refund Pending Shelf");
		Book book = seedBook(category, "9780306400300", 2);
		createRefundRequestedOrder(customer, book, 1, "49.00");

		String token = createToken("refund-sales@example.com", UserRole.SALES_MANAGER);
		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/refunds"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body())).hasSize(1);
		assertThat(objectMapper.readTree(response.body()).get(0).get("status").asText())
			.isEqualTo("REFUND_REQUESTED");
	}

	@Test
	void shouldApproveRefundAndRestoreStock() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("refund-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Refund Approval Shelf");
		Book book = seedBook(category, "9780306400301", 3);
		Order order = createRefundRequestedOrder(customer, book, 2, "49.00");

		String token = createToken("refund-sales@example.com", UserRole.SALES_MANAGER);
		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/refunds/" + order.getId() + "/approve"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("REFUNDED");
		assertThat(bookRepository.findById(book.getId()).orElseThrow().getStockQuantity()).isEqualTo(5);
	}

	@Test
	void shouldRejectRefundRequestAndReturnOrderToDelivered() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("refund-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Refund Rejection Shelf");
		Book book = seedBook(category, "9780306400302", 3);
		Order order = createRefundRequestedOrder(customer, book, 1, "49.00");

		String token = createToken("refund-sales@example.com", UserRole.SALES_MANAGER);
		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/refunds/" + order.getId() + "/reject"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("DELIVERED");
		assertThat(orderRepository.findById(order.getId()).orElseThrow().getRefundRequestedAt()).isNull();
	}

	@Test
	void shouldRejectRefundAdminAccessForProductManager() throws IOException, InterruptedException {
		String token = createToken("refund-product@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/refunds"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Refund Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("refund12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("refund12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Category seedCategory(String name) {
		return categoryRepository.saveAndFlush(Category.builder()
			.name(name)
			.description("Category for refund admin integration tests.")
			.iconName("BookOpen")
			.build());
	}

	private Book seedBook(Category category, String isbn, int stockQuantity) {
		return bookRepository.saveAndFlush(Book.builder()
			.title("Refund Integration Book")
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for refund admin integration testing.")
			.stockQuantity(stockQuantity)
			.price(new BigDecimal("49.00"))
			.originalPrice(new BigDecimal("59.00"))
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(320)
			.language("English")
			.publicationYear(2026)
			.coverColor("#7A2222")
			.category(category)
			.build());
	}

	private Order createRefundRequestedOrder(
		com.aurelia.model.User customer,
		Book book,
		int quantity,
		String unitPrice
	) {
		Order order = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(new BigDecimal(unitPrice).multiply(BigDecimal.valueOf(quantity)))
			.status(OrderStatus.REFUND_REQUESTED)
			.shippingAddress("12 Aurelia Lane")
			.build());

		orderItemRepository.saveAndFlush(OrderItem.builder()
			.order(order)
			.book(book)
			.quantity(quantity)
			.unitPrice(new BigDecimal(unitPrice))
			.discountApplied(BigDecimal.ZERO)
			.build());

		jdbcTemplate.update(
			"update orders set delivered_at = ?, refund_requested_at = ? where id = ?",
			Timestamp.from(Instant.parse("2026-03-10T09:00:00Z")),
			Timestamp.from(Instant.parse("2026-03-20T09:00:00Z")),
			order.getId()
		);

		return orderRepository.findById(order.getId()).orElseThrow();
	}

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
