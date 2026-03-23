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
import com.aurelia.model.UserRole;
import com.aurelia.model.Wishlist;
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
class DiscountNotificationControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"discount-customer@example.com",
		"discount-sales@example.com",
		"discount-product@example.com"
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
	void shouldApplyDiscountAndCreateWishlistNotification() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser(
			"discount-customer@example.com",
			UserRole.CUSTOMER
		);
		Category category = seedCategory("Discount Shelf");
		Book book = seedBook(category, "9780306400400");
		wishlistRepository.saveAndFlush(Wishlist.builder()
			.customer(customer)
			.book(book)
			.build());

		String salesToken = createToken("discount-sales@example.com", UserRole.SALES_MANAGER);
		String customerToken = createToken(customer.getEmail(), UserRole.CUSTOMER);

		HttpResponse<String> discountResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/discounts"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + salesToken)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.POST(HttpRequest.BodyPublishers.ofString("""
					{
					  "bookIds": [%d],
					  "percentage": 20
					}
					""".formatted(book.getId())))
				.build()
		);

		assertThat(discountResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(discountResponse.body()).get(0).get("price").decimalValue())
			.isEqualByComparingTo("80.00");
		assertThat(objectMapper.readTree(discountResponse.body()).get(0).get("originalPrice").decimalValue())
			.isEqualByComparingTo("100.00");
		assertThat(notificationRepository.findAll()).hasSize(1);

		HttpResponse<String> notificationsResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/notifications"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + customerToken)
				.GET()
				.build()
		);

		assertThat(notificationsResponse.statusCode()).isEqualTo(200);
		long notificationId = objectMapper.readTree(notificationsResponse.body()).get(0).get("id").asLong();
		assertThat(objectMapper.readTree(notificationsResponse.body()).get(0).get("message").asText())
			.contains("20% off");

		HttpResponse<String> markReadResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/notifications/" + notificationId + "/read"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + customerToken)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(markReadResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(markReadResponse.body()).get("read").asBoolean()).isTrue();
	}

	@Test
	void shouldRejectDiscountAccessForProductManager() throws IOException, InterruptedException {
		Category category = seedCategory("Protected Shelf");
		Book book = seedBook(category, "9780306400401");
		String productManagerToken = createToken("discount-product@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/admin/discounts"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + productManagerToken)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.POST(HttpRequest.BodyPublishers.ofString("""
					{
					  "bookIds": [%d],
					  "percentage": 10
					}
					""".formatted(book.getId())))
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(403);
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Discount Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("discount12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("discount12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Category seedCategory(String name) {
		return categoryRepository.saveAndFlush(Category.builder()
			.name(name)
			.description("Category for discount integration tests.")
			.iconName("BookOpen")
			.build());
	}

	private Book seedBook(Category category, String isbn) {
		return bookRepository.saveAndFlush(Book.builder()
			.title("Discount Integration Book")
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for discount integration testing.")
			.stockQuantity(6)
			.price(new BigDecimal("100.00"))
			.originalPrice(null)
			.returnPolicy("30-day returns")
			.publisher("Aurelia Editions")
			.pageCount(300)
			.language("English")
			.publicationYear(2026)
			.coverColor("#7A2222")
			.category(category)
			.build());
	}

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
