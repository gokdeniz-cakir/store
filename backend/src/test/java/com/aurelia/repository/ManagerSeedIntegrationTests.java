package com.aurelia.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.aurelia.model.User;
import com.aurelia.model.UserRole;

@SpringBootTest
class ManagerSeedIntegrationTests {

	@Autowired
	private UserRepository userRepository;

	@Test
	void shouldSeedManagerAccounts() {
		assertThat(userRepository.findByEmail("sales.manager@aurelia.com"))
			.isPresent()
			.get()
			.extracting(User::getName, User::getRole)
			.containsExactly("Aurelia Sales Manager", UserRole.SALES_MANAGER);

		assertThat(userRepository.findByEmail("product.manager@aurelia.com"))
			.isPresent()
			.get()
			.extracting(User::getName, User::getRole)
			.containsExactly("Aurelia Product Manager", UserRole.PRODUCT_MANAGER);
	}
}
