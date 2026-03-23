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
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.CategoryRepository;
import com.aurelia.repository.CreditCardRepository;
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CatalogControllerIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"catalog-manager@example.com",
		"catalog-customer@example.com"
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
	private CreditCardRepository creditCardRepository;

	@Autowired
	private OrderItemRepository orderItemRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserRepository userRepository;

	@LocalServerPort
	private int port;

	@BeforeEach
	void setUp() {
		orderItemRepository.deleteAll();
		orderRepository.deleteAll();
		creditCardRepository.deleteAll();
		bookRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteByEmailIn(TEST_EMAILS);
	}

	@Test
	void shouldReturnPublicBookSearchResults() throws IOException, InterruptedException {
		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Myth")
			.description("Epic and classical texts.")
			.iconName("scroll")
			.build());

		bookRepository.saveAndFlush(Book.builder()
			.title("The Odyssey")
			.author("Homer")
			.isbn("9780140268867")
			.edition("Collector's Edition")
			.description("Greek epic poetry.")
			.stockQuantity(8)
			.price(new BigDecimal("89.00"))
			.publisher("Aurelia Editions")
			.coverColor("#2F4858")
			.category(category)
			.build());

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/books?q=odyssey"))
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).at("/content/0/title").asText())
			.isEqualTo("The Odyssey");
		assertThat(objectMapper.readTree(response.body()).at("/content/0/category/name").asText())
			.isEqualTo("Myth");
	}

	@Test
	void shouldReturnPublicBookResultsWithoutSearchTerm() throws IOException, InterruptedException {
		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Travel Writing")
			.description("Journals and voyages.")
			.iconName("map-trifold")
			.build());

		bookRepository.saveAndFlush(Book.builder()
			.title("Atlas of Evening Roads")
			.author("Marin Holt")
			.isbn("9780140268868")
			.edition("Collector's Edition")
			.description("A survey of luminous routes.")
			.stockQuantity(4)
			.price(new BigDecimal("67.00"))
			.publisher("Aurelia Editions")
			.coverColor("#5C1717")
			.category(category)
			.build());

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/books"))
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).at("/content/0/title").asText())
			.isEqualTo("Atlas of Evening Roads");
	}

	@Test
	void shouldReturnPublicCategories() throws IOException, InterruptedException {
		categoryRepository.saveAndFlush(Category.builder()
			.name("History")
			.description("Chronicles and records.")
			.iconName("bank")
			.build());

		HttpResponse<String> response = sendRequest(
			HttpRequest.newBuilder()
				.uri(URI.create("http://localhost:" + port + "/api/categories"))
				.GET()
				.build()
		);

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).get(0).get("name").asText())
			.isEqualTo("History");
	}

	@Test
	void shouldAllowProductManagerToCreateBook() throws IOException, InterruptedException {
		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Science Fiction")
			.description("Speculative futures and worlds.")
			.iconName("planet")
			.build());

		String token = createToken("catalog-manager@example.com", UserRole.PRODUCT_MANAGER);

		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + "/api/books"))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString("""
				{
				  "title": "Dune",
				  "author": "Frank Herbert",
				  "isbn": "9780441172719",
				  "edition": "Deluxe Hardcover",
				  "description": "Epic science fiction in a deluxe binding.",
				  "stockQuantity": 15,
				  "price": 125.00,
				  "originalPrice": 149.00,
				  "returnPolicy": "30-day returns",
				  "publisher": "Aurelia Editions",
				  "pageCount": 688,
				  "language": "English",
				  "publicationYear": 2024,
				  "coverImageUrl": "https://example.com/dune.jpg",
				  "coverColor": "#C4A97F",
				  "categoryId": %d
				}
				""".formatted(category.getId())))
			.build();

		HttpResponse<String> response = sendRequest(request);

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(bookRepository.findAll()).hasSize(1);
		assertThat(objectMapper.readTree(response.body()).get("title").asText()).isEqualTo("Dune");
	}

	@Test
	void shouldRejectCustomerBookCreation() throws IOException, InterruptedException {
		Category category = categoryRepository.saveAndFlush(Category.builder()
			.name("Classics")
			.description("Enduring literary works.")
			.iconName("book-open-text")
			.build());

		String token = createToken("catalog-customer@example.com", UserRole.CUSTOMER);

		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create("http://localhost:" + port + "/api/books"))
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString("""
				{
				  "title": "Jane Eyre",
				  "author": "Charlotte Bronte",
				  "isbn": "9780141441146",
				  "edition": "Linen Edition",
				  "stockQuantity": 5,
				  "price": 79.00,
				  "publisher": "Aurelia Editions",
				  "coverColor": "#5C1717",
				  "categoryId": %d
				}
				""".formatted(category.getId())))
			.build();

		HttpResponse<String> response = sendRequest(request);

		assertThat(response.statusCode()).isEqualTo(403);
		assertThat(bookRepository.findAll()).isEmpty();
	}

	private HttpResponse<String> sendRequest(HttpRequest request)
		throws IOException, InterruptedException {
		return HttpClient.newHttpClient()
			.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private String createToken(String email, UserRole role) {
		userRepository.saveAndFlush(com.aurelia.model.User.builder()
			.name("Catalog Test User")
			.email(email)
			.passwordHash(passwordEncoder.encode("catalog123"))
			.role(role)
			.build());

		return jwtService.generateToken(User.builder()
			.username(email)
			.password("catalog123")
			.authorities("ROLE_" + role.name())
			.build());
	}
}
