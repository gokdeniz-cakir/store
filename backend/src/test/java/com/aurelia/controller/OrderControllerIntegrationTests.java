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
import org.springframework.http.MediaType;
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
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;
import com.aurelia.repository.ReviewRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.repository.WishlistRepository;
import com.aurelia.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"order-customer@example.com",
		"other-customer@example.com",
		"order-manager@example.com"
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
	void shouldPlaceOrderAndDecrementStock() throws IOException, InterruptedException {
		Category category = seedCategory("Fine Fiction");
		Book book = seedBook(category, "9780306400200", 5);
		String token = createToken("order-customer@example.com", UserRole.CUSTOMER);

		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + "/api/orders"))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString("""
				{
				  "shippingAddress": "12 Aurelia Lane",
				  "creditCard": {
				    "cardNumber": "4111111111111111",
				    "cardholderName": "Order Customer",
				    "expiryMonth": 12,
				    "expiryYear": 2030
				  },
				  "items": [
				    {
				      "bookId": %d,
				      "quantity": 2
				    }
				  ]
				}
				""".formatted(book.getId())))
			.build();

		HttpResponse<String> response = sendRequest(request);

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("PROCESSING");
		assertThat(objectMapper.readTree(response.body()).get("totalPrice").decimalValue())
			.isEqualByComparingTo("98.00");
		assertThat(orderRepository.findAll()).hasSize(1);
		assertThat(creditCardRepository.findAll()).hasSize(1);
		assertThat(bookRepository.findById(book.getId()).orElseThrow().getStockQuantity()).isEqualTo(3);
		assertThat(creditCardRepository.findAll().getFirst().getCardNumberEncrypted())
			.isNotEqualTo("4111111111111111");
	}

	@Test
	void shouldRejectOrderWhenStockIsInsufficient() throws IOException, InterruptedException {
		Category category = seedCategory("Rare Editions");
		Book book = seedBook(category, "9780306400201", 1);
		String token = createToken("order-customer@example.com", UserRole.CUSTOMER);

		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + "/api/orders"))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString("""
				{
				  "shippingAddress": "12 Aurelia Lane",
				  "creditCard": {
				    "cardNumber": "4111111111111111",
				    "cardholderName": "Order Customer",
				    "expiryMonth": 12,
				    "expiryYear": 2030
				  },
				  "items": [
				    {
				      "bookId": %d,
				      "quantity": 2
				    }
				  ]
				}
				""".formatted(book.getId())))
			.build();

		HttpResponse<String> response = sendRequest(request);

		assertThat(response.statusCode()).isEqualTo(409);
		assertThat(orderRepository.findAll()).isEmpty();
		assertThat(bookRepository.findById(book.getId()).orElseThrow().getStockQuantity()).isEqualTo(1);
	}

	@Test
	void shouldReturnOnlyCustomerOwnedOrders() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		com.aurelia.model.User otherCustomer = createPersistedUser("other-customer@example.com", UserRole.CUSTOMER);

		Order ownedOrder = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(new BigDecimal("45.00"))
			.status(OrderStatus.PROCESSING)
			.shippingAddress("12 Aurelia Lane")
			.build());

		orderRepository.saveAndFlush(Order.builder()
			.customer(otherCustomer)
			.totalPrice(new BigDecimal("55.00"))
			.status(OrderStatus.DELIVERED)
			.shippingAddress("22 Other Street")
			.build());

		String token = createToken("order-customer@example.com", UserRole.CUSTOMER);

		HttpResponse<String> listResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		HttpResponse<String> detailResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + ownedOrder.getId()))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(listResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(listResponse.body()).at("/content").size()).isEqualTo(1);
		assertThat(objectMapper.readTree(detailResponse.body()).get("id").asLong()).isEqualTo(ownedOrder.getId());
	}

	@Test
	void shouldRejectManagerAccessToCustomerOrders() throws IOException, InterruptedException {
		String token = createToken("order-manager@example.com", UserRole.SALES_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	@Test
	void shouldAllowCustomerToDownloadOwnInvoice() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Invoice Fiction");
		Book book = seedBook(category, "9780306400202", 4);
		Order order = createOrderWithItem(customer, book);
		String token = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<byte[]> response = sendBinaryRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/invoice"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.headers().firstValue(HttpHeaders.CONTENT_TYPE)).hasValue(MediaType.APPLICATION_PDF_VALUE);
		assertThat(response.headers().firstValue(HttpHeaders.CONTENT_DISPOSITION))
			.hasValue("attachment; filename=\"aurelia-order-" + order.getId() + "-invoice.pdf\"");
		assertThat(new String(response.body(), 0, 4)).isEqualTo("%PDF");
	}

	@Test
	void shouldRejectInvoiceDownloadForOtherCustomer() throws IOException, InterruptedException {
		com.aurelia.model.User owner = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		com.aurelia.model.User otherCustomer = createPersistedUser("other-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Invoice History");
		Book book = seedBook(category, "9780306400203", 4);
		Order order = createOrderWithItem(owner, book);
		String token = createToken(otherCustomer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<byte[]> response = sendBinaryRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/invoice"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(404);
	}

	@Test
	void shouldAllowSalesManagerToDownloadCustomerInvoice() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Invoice Management");
		Book book = seedBook(category, "9780306400204", 4);
		Order order = createOrderWithItem(customer, book);
		String token = createToken("order-manager@example.com", UserRole.SALES_MANAGER);

		HttpResponse<byte[]> response = sendBinaryRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/invoice"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(new String(response.body(), 0, 4)).isEqualTo("%PDF");
	}

	@Test
	void shouldCancelProcessingOrderAndRestoreStock() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Cancellation Shelf");
		Book book = seedBook(category, "9780306400205", 2);
		Order order = createOrderWithItem(customer, book, OrderStatus.PROCESSING, 2, "98.00", "0.00");
		String token = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/cancel"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("CANCELLED");
		assertThat(bookRepository.findById(book.getId()).orElseThrow().getStockQuantity()).isEqualTo(4);
	}

	@Test
	void shouldRejectCancellationForDeliveredOrder() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Delivered Shelf");
		Book book = seedBook(category, "9780306400206", 3);
		Order order = createOrderWithItem(customer, book, OrderStatus.DELIVERED, 1, "49.00", "0.00");
		String token = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/cancel"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(409);
	}

	@Test
	void shouldRequestRefundWithinThirtyDaysOfDelivery() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Refund Shelf");
		Book book = seedBook(category, "9780306400207", 5);
		Order order = createOrderWithItem(customer, book, OrderStatus.DELIVERED, 1, "49.00", "10.00");
		setOrderLifecycleDates(order.getId(), "2026-03-10T10:00:00Z", "2026-03-20T10:00:00Z");
		String token = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/refund"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.POST(HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("REFUND_REQUESTED");
		assertThat(objectMapper.readTree(response.body()).get("refundAmount").decimalValue())
			.isEqualByComparingTo("49.00");
		assertThat(orderRepository.findById(order.getId()).orElseThrow().getRefundRequestedAt()).isNotNull();
	}

	@Test
	void shouldRejectRefundRequestAfterThirtyDays() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("order-customer@example.com", UserRole.CUSTOMER);
		Category category = seedCategory("Expired Refund Shelf");
		Book book = seedBook(category, "9780306400208", 5);
		Order order = createOrderWithItem(customer, book, OrderStatus.DELIVERED, 1, "49.00", "0.00");
		setOrderLifecycleDates(order.getId(), "2025-01-10T10:00:00Z", "2025-01-20T10:00:00Z");
		String token = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/orders/" + order.getId() + "/refund"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.POST(HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(409);
		assertThat(orderRepository.findById(order.getId()).orElseThrow().getStatus()).isEqualTo(OrderStatus.DELIVERED);
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Order Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("order12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("order12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Category seedCategory(String name) {
		return categoryRepository.saveAndFlush(Category.builder()
			.name(name)
			.description("Category for order integration tests.")
			.iconName("BookOpen")
			.build());
	}

	private Book seedBook(Category category, String isbn, int stockQuantity) {
		return bookRepository.saveAndFlush(Book.builder()
			.title("Order Integration Book")
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for order integration testing.")
			.stockQuantity(stockQuantity)
			.price(new BigDecimal("49.00"))
			.originalPrice(new BigDecimal("59.00"))
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(300)
			.language("English")
			.publicationYear(2024)
			.coverColor("#7A2222")
			.category(category)
			.build());
	}

	private Order createOrderWithItem(com.aurelia.model.User customer, Book book) {
		return createOrderWithItem(customer, book, OrderStatus.PROCESSING, 1, "49.00", "0.00");
	}

	private Order createOrderWithItem(
		com.aurelia.model.User customer,
		Book book,
		OrderStatus status,
		int quantity,
		String unitPrice,
		String discountApplied
	) {
		Order order = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(new BigDecimal(unitPrice).multiply(BigDecimal.valueOf(quantity)))
			.status(status)
			.shippingAddress("12 Aurelia Lane")
			.build());

		orderItemRepository.saveAndFlush(OrderItem.builder()
			.order(order)
			.book(book)
			.quantity(quantity)
			.unitPrice(new BigDecimal(unitPrice))
			.discountApplied(new BigDecimal(discountApplied))
			.build());

		return orderRepository.findById(order.getId()).orElseThrow();
	}

	private void setOrderLifecycleDates(Long orderId, String updatedAt, String deliveredAt) {
		jdbcTemplate.update(
			"update orders set updated_at = ?, delivered_at = ? where id = ?",
			Timestamp.from(Instant.parse(updatedAt)),
			Timestamp.from(Instant.parse(deliveredAt)),
			orderId
		);
	}

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<byte[]> sendBinaryRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofByteArray());
	}
}
