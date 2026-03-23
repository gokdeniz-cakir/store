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
import com.aurelia.model.Review;
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
class ReviewWishlistControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"review-customer@example.com",
		"review-manager@example.com",
		"wishlist-customer@example.com"
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
	void shouldCreatePendingReviewForCustomer() throws IOException, InterruptedException {
		Book book = seedBook("Review Creation Book", "9780306400290");
		String token = createToken("review-customer@example.com", UserRole.CUSTOMER);

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/books/" + book.getId() + "/reviews"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.POST(HttpRequest.BodyPublishers.ofString("""
					{
					  "rating": 5,
					  "comment": "An exceptional edition."
					}
					"""))
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(response.body()).get("approved").asBoolean()).isFalse();
		assertThat(reviewRepository.findAll()).hasSize(1);
	}

	@Test
	void shouldExposeOnlyApprovedReviewsPubliclyAndSortBooksByPopularity() throws IOException, InterruptedException {
		com.aurelia.model.User firstCustomer = createPersistedUser("review-customer@example.com", UserRole.CUSTOMER);
		com.aurelia.model.User secondCustomer = createPersistedUser("wishlist-customer@example.com", UserRole.CUSTOMER);
		Book higherRatedBook = seedBook("Popular Book", "9780306400291");
		Book lowerRatedBook = seedBook("Less Popular Book", "9780306400292");

		reviewRepository.saveAndFlush(Review.builder()
			.book(higherRatedBook)
			.customer(firstCustomer)
			.rating((short) 5)
			.comment("Outstanding.")
			.approved(true)
			.build());
		reviewRepository.saveAndFlush(Review.builder()
			.book(lowerRatedBook)
			.customer(secondCustomer)
			.rating((short) 3)
			.comment("Decent.")
			.approved(true)
			.build());
		reviewRepository.saveAndFlush(Review.builder()
			.book(higherRatedBook)
			.customer(secondCustomer)
			.rating((short) 4)
			.comment("Still pending.")
			.approved(false)
			.build());

		HttpResponse<String> publicReviewsResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/books/" + higherRatedBook.getId() + "/reviews"))
				.GET()
				.build()
		);
		HttpResponse<String> popularityResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/books?sort=popularity,desc&size=2"))
				.GET()
				.build()
		);

		assertThat(publicReviewsResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(publicReviewsResponse.body()).size()).isEqualTo(1);
		assertThat(popularityResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(popularityResponse.body()).at("/content/0/title").asText())
			.isEqualTo("Popular Book");
		assertThat(objectMapper.readTree(popularityResponse.body()).at("/content/0/averageRating").asDouble())
			.isEqualTo(5.0);
	}

	@Test
	void shouldAllowProductManagerToApproveAndRejectPendingReviews() throws IOException, InterruptedException {
		com.aurelia.model.User customer = createPersistedUser("review-customer@example.com", UserRole.CUSTOMER);
		com.aurelia.model.User secondCustomer = createPersistedUser("wishlist-customer@example.com", UserRole.CUSTOMER);
		Book book = seedBook("Moderation Book", "9780306400293");
		Review pendingReview = reviewRepository.saveAndFlush(Review.builder()
			.book(book)
			.customer(customer)
			.rating((short) 4)
			.comment("Awaiting moderation.")
			.approved(false)
			.build());
		Review rejectedReview = reviewRepository.saveAndFlush(Review.builder()
			.book(book)
			.customer(secondCustomer)
			.rating((short) 2)
			.comment("Should be rejected.")
			.approved(false)
			.build());
		String managerToken = createToken("review-manager@example.com", UserRole.PRODUCT_MANAGER);

		HttpResponse<String> pendingResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/reviews/pending"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + managerToken)
				.GET()
				.build()
		);
		HttpResponse<String> approveResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/reviews/" + pendingReview.getId() + "/approve"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + managerToken)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);
		HttpResponse<String> rejectResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/reviews/" + rejectedReview.getId() + "/reject"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + managerToken)
				.method("PATCH", HttpRequest.BodyPublishers.noBody())
				.build()
		);

		assertThat(pendingResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(pendingResponse.body()).size()).isEqualTo(2);
		assertThat(approveResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(approveResponse.body()).get("approved").asBoolean()).isTrue();
		assertThat(rejectResponse.statusCode()).isEqualTo(204);
		assertThat(reviewRepository.findById(rejectedReview.getId())).isEmpty();
	}

	@Test
	void shouldManageWishlistForCustomer() throws IOException, InterruptedException {
		Book book = seedBook("Wishlist Book", "9780306400294");
		String token = createToken("wishlist-customer@example.com", UserRole.CUSTOMER);

		HttpResponse<String> addResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/wishlist/" + book.getId()))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.POST(HttpRequest.BodyPublishers.noBody())
				.build()
		);
		HttpResponse<String> listResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/wishlist"))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.GET()
				.build()
		);
		HttpResponse<String> deleteResponse = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/wishlist/" + book.getId()))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.DELETE()
				.build()
		);

		assertThat(addResponse.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(addResponse.body()).get("title").asText()).isEqualTo("Wishlist Book");
		assertThat(listResponse.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(listResponse.body()).size()).isEqualTo(1);
		assertThat(deleteResponse.statusCode()).isEqualTo(204);
		assertThat(wishlistRepository.findAll()).isEmpty();
	}

	private com.aurelia.model.User createPersistedUser(String email, UserRole role) {
		return userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Review Wishlist User")
			.email(email)
			.passwordHash(passwordEncoder.encode("review12345"))
			.role(role)
			.homeAddress("12 Aurelia Lane")
			.build());
	}

	private String createToken(String email, UserRole role) {
		userRepository.findByEmail(email).orElseGet(() -> createPersistedUser(email, role));

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("review12345")
			.authorities("ROLE_" + role.name())
			.build());
	}

	private Book seedBook(String title, String isbn) {
		Category category = categoryRepository.findByNameIgnoreCase("Fiction")
			.orElseGet(() -> categoryRepository.saveAndFlush(Category.builder()
				.name("Fiction")
				.description("Review wishlist integration category.")
				.iconName("BookOpen")
				.build()));

		return bookRepository.saveAndFlush(Book.builder()
			.title(title)
			.author("Aurelia Author")
			.isbn(isbn)
			.edition("Collector's Edition")
			.description("A book used for review and wishlist integration testing.")
			.stockQuantity(7)
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

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
