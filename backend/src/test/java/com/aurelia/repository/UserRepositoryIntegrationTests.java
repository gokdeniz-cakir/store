package com.aurelia.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.aurelia.model.User;
import com.aurelia.model.UserRole;

@SpringBootTest
class UserRepositoryIntegrationTests {

	private static final List<String> TEST_EMAILS = List.of(
		"ada@example.com",
		"mary@example.com"
	);

	@Autowired
	private UserRepository userRepository;

	@BeforeEach
	void setUp() {
		userRepository.deleteByEmailIn(TEST_EMAILS);
	}

	@Test
	void shouldFindUserByEmail() {
		User user = User.builder()
			.name("Ada Lovelace")
			.email("ada@example.com")
			.passwordHash("hashed-password")
			.taxId("TR-1234567890")
			.homeAddress("London")
			.role(UserRole.CUSTOMER)
			.build();

		userRepository.saveAndFlush(user);

		assertThat(userRepository.findByEmail("ada@example.com"))
			.isPresent()
			.get()
			.extracting(User::getName, User::getRole)
			.containsExactly("Ada Lovelace", UserRole.CUSTOMER);
	}

	@Test
	void shouldReportWhetherEmailExists() {
		User user = User.builder()
			.name("Mary Shelley")
			.email("mary@example.com")
			.passwordHash("hashed-password")
			.role(UserRole.CUSTOMER)
			.build();

		userRepository.saveAndFlush(user);

		assertThat(userRepository.existsByEmail("mary@example.com")).isTrue();
		assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
	}
}
