package com.aurelia.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class AesEncryptionUtilTests {

	@Test
	void shouldEncryptAndDecryptValuesWithAesGcm() {
		AesEncryptionUtil encryptionUtil = new AesEncryptionUtil("development-test-secret");
		String plainText = "4111111111111111";

		String encryptedValue = encryptionUtil.encrypt(plainText);
		String decryptedValue = encryptionUtil.decrypt(encryptedValue);

		assertThat(encryptedValue).isNotEqualTo(plainText);
		assertThat(decryptedValue).isEqualTo(plainText);
	}

	@Test
	void shouldRejectBlankSecrets() {
		assertThatThrownBy(() -> new AesEncryptionUtil(" "))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("AES secret must not be blank.");
	}
}
