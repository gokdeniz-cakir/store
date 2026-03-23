package com.aurelia.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;
import com.aurelia.repository.ReviewRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.repository.WishlistRepository;
import com.aurelia.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DeliveryControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"delivery-customer@example.com",
		"delivery-manager@example.com",
		"delivery-sales@example.com"
	);

	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	@Autowired
	private BookRepository bookRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private JwtService jwtService;

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
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteByEmailIn(TEST_EMAILS);
	}

	@Test
	void shouldReturnDeliveriesForProductManager() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser(
			"delivery-customer@example.com",
			UserRole.CUSTOMER
		);
		Category category = seedCategory("Deliveries");
		Book book = seedBook(category, "9780306400300");
		OrderItem delivery = createDelivery(customer, book, OrderStatus.PROCESSING);
		String token = createToken("delivery-manager@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/deliveries"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).size()).isEqualTo(1);
		assertThat(objectMapper.readTree(response.body()).get(0).get("id").asLong()).isEqualTo(delivery.getId());
		assertThat(objectMapper.readTree(response.body()).get(0).get("status").asText()).isEqualTo("PROCESSING");
	}

	@Test
	void shouldAdvanceDeliveryStatusInOrderSequence() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser(
			"delivery-customer@example.com",
			UserRole.CUSTOMER
		);
		Category category = seedCategory("Delivery Status");
		Book book = seedBook(category, "9780306400301");
		OrderItem delivery = createDelivery(customer, book, OrderStatus.PROCESSING);
		String token = createToken("delivery-manager@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/deliveries/" + delivery.getId() + "/status"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.method("PATCH", HttpRequest.BodyPublishers.ofString("""
					{
					  "status": "IN_TRANSIT"
					}
					"""))
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get("status").asText()).isEqualTo("IN_TRANSIT");
		assertThat(orderRepository.findById(delivery.getOrder().getId()).orElseThrow().getStatus())
			.isEqualTo(OrderStatus.IN_TRANSIT);
	}

	@Test
	void shouldRejectSkippingDeliveryStatus() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser(
			"delivery-customer@example.com",
			UserRole.CUSTOMER
		);
		Category category = seedCategory("Delivery Flow");
		Book book = seedBook(category, "9780306400302");
		OrderItem delivery = createDelivery(customer, book, OrderStatus.PROCESSING);
		String token = createToken("delivery-manager@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/deliveries/" + delivery.getId() + "/status"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.method("PATCH", HttpRequest.BodyPublishers.ofString("""
					{
					  "status": "DELIVERED"
					}
					"""))
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(409);
		assertThat(orderRepository.findById(delivery.getOrder().getId()).orElseThrow().getStatus())
			.isEqualTo(OrderStatus.PROCESSING);
	}

	@Test
	void shouldRejectCustomerAccessToDeliveries() throws IOException, InterruptedException {
		String token = createToken("delivery-customer@example.com", UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/deliveries"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Delivery Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("delivery12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("delivery12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Category seedCategory(String name) {
		return categoryRepository.saveAndFlush(Category.builder()
			.name(name)
			.description("Category for delivery integration tests.")
			.iconName("BookOpen")
			.build());
	}

	private Book seedBook(Category category, String isbn) {
		return bookRepository.saveAndFlush(Book.builder()
			.title("Delivery Integration Book")
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for delivery integration testing.")
			.stockQuantity(8)
			.price(new BigDecimal("52.00"))
			.originalPrice(new BigDecimal("60.00"))
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(320)
			.language("English")
			.publicationYear(2025)
			.coverColor("#7A2222")
			.category(category)
			.build());
	}

	private OrderItem createDelivery(
		com.aurelia.model.User customer,
		Book book,
		OrderStatus status
	) {
		Order order = orderRepository.saveAndFlush(Order.builder()
			.customer(customer)
			.totalPrice(book.getPrice())
			.status(status)
			.shippingAddress("12 Aurelia Lane")
			.build());

		return orderItemRepository.saveAndFlush(OrderItem.builder()
			.order(order)
			.book(book)
			.quantity(1)
			.unitPrice(book.getPrice())
			.discountApplied(BigDecimal.ZERO)
			.build());
	}

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
