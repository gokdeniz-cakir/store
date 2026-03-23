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
class SalesAnalyticsControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"analytics-customer@example.com",
		"analytics-sales@example.com",
		"analytics-product@example.com"
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
	private JwtService jwtService;

	@Autowired
	private JdbcTemplate jdbcTemplate;

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
	void shouldListInvoicesWithinRequestedDateRange() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("analytics-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Invoice Shelf");
		Book book = seedBook(category, "9780306400700");
		createOrder(customer, book, OrderStatus.PROCESSING, "42.00", "8.00", "2026-03-20T10:00:00Z");
		createOrder(customer, book, OrderStatus.DELIVERED, "58.00", "0.00", "2026-03-21T11:00:00Z");

		String token = createToken("analytics-sales@example.com", UserRole.SALES_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/invoices?startDate=2026-03-20&endDate=2026-03-20"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body())).hasSize(1);
		assertThat(objectMapper.readTree(response.body()).get(0).get("totalPrice").decimalValue())
			.isEqualByComparingTo("42.00");
		assertThat(objectMapper.readTree(response.body()).get(0).get("discountTotal").decimalValue())
			.isEqualByComparingTo("8.00");
	}

	@Test
	void shouldReturnRevenueAnalyticsAndExcludeCancelledOrders() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("analytics-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Revenue Shelf");
		Book book = seedBook(category, "9780306400701");
		createOrder(customer, book, OrderStatus.DELIVERED, "50.00", "10.00", "2026-03-20T10:00:00Z");
		createOrder(customer, book, OrderStatus.PROCESSING, "30.00", "0.00", "2026-03-21T12:00:00Z");
		createOrder(customer, book, OrderStatus.CANCELLED, "99.00", "0.00", "2026-03-21T13:00:00Z");

		String token = createToken("analytics-sales@example.com", UserRole.SALES_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/revenue?startDate=2026-03-20&endDate=2026-03-21"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("revenue").decimalValue())
			.isEqualByComparingTo("90.00");
		assertThat(objectMapper.readTree(response.body()).get("profit").decimalValue())
			.isEqualByComparingTo("80.00");
		assertThat(objectMapper.readTree(response.body()).get("discountTotal").decimalValue())
			.isEqualByComparingTo("10.00");
		assertThat(objectMapper.readTree(response.body()).get("orderCount").asLong()).isEqualTo(2);
		assertThat(objectMapper.readTree(response.body()).withArray("breakdown").size()).isEqualTo(2);
		assertThat(objectMapper.readTree(response.body()).withArray("breakdown").get(0).get("revenue").decimalValue())
			.isEqualByComparingTo("60.00");
		assertThat(objectMapper.readTree(response.body()).withArray("breakdown").get(1).get("profit").decimalValue())
			.isEqualByComparingTo("30.00");
	}

	@Test
	void shouldRejectRevenueAccessForProductManager() throws IOException, InterruptedException {
		String token = createToken("analytics-product@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/revenue?startDate=2026-03-20&endDate=2026-03-21"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Analytics Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("analytics12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("analytics12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Category seedCategory(String name) {
		return categoryRepository.saveAndFlush(Category.builder()
			.name(name)
			.description("Category for analytics integration tests.")
			.iconName("BookOpen")
			.build());
	}

	private Book seedBook(Category category, String isbn) {
		return bookRepository.saveAndFlush(Book.builder()
			.title("Analytics Integration Book")
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for analytics integration testing.")
			.stockQuantity(8)
			.price(new BigDecimal("50.00"))
			.originalPrice(new BigDecimal("60.00"))
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(320)
			.language("English")
			.publicationYear(2026)
			.coverColor("#7A2222")
			.category(category)
			.build());
	}

	private Order createOrder(
		com.aurelia.model.User customer,
		Book book,
		OrderStatus status,
		String totalPrice,
		String discountApplied,
		String createdAt
	) {
		Order order = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(new BigDecimal(totalPrice))
			.status(status)
			.shippingAddress("12 Aurelia Lane")
			.build());

		orderItemRepository.saveAndFlush(OrderItem.builder()
			.order(order)
			.book(book)
			.quantity(1)
			.unitPrice(new BigDecimal(totalPrice))
			.discountApplied(new BigDecimal(discountApplied))
			.build());

		jdbcTemplate.update(
			"update orders set created_at = ? where id = ?",
			Timestamp.from(Instant.parse(createdAt)),
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
