package com.aurelia.util;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AesEncryptionUtil {

	private static final String AES_ALGORITHM = "AES";
	private static final String TRANSFORMATION = "AES/GCM/NoPadding";
	private static final int GCM_TAG_LENGTH_BITS = 128;
	private static final int IV_LENGTH_BYTES = 12;

	private final SecureRandom secureRandom = new SecureRandom();
	private final SecretKey secretKey;

	public AesEncryptionUtil(@Value("${app.encryption.aes-secret:${jwt.secret}}") String secret) {
		this.secretKey = new SecretKeySpec(deriveKey(secret), AES_ALGORITHM);
	}

	public String encrypt(String plainText) {
		try {
			byte[] iv = new byte[IV_LENGTH_BYTES];
			secureRandom.nextBytes(iv);

			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

			byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
			ByteBuffer buffer = ByteBuffer.allocate(iv.length + encryptedBytes.length);
			buffer.put(iv);
			buffer.put(encryptedBytes);

			return Base64.getEncoder().encodeToString(buffer.array());
		} catch (Exception exception) {
			throw new IllegalStateException("Unable to encrypt value.", exception);
		}
	}

	public String decrypt(String encryptedText) {
		try {
			byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
			ByteBuffer buffer = ByteBuffer.wrap(decodedBytes);

			byte[] iv = new byte[IV_LENGTH_BYTES];
			buffer.get(iv);

			byte[] cipherBytes = new byte[buffer.remaining()];
			buffer.get(cipherBytes);

			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

			return new String(cipher.doFinal(cipherBytes), StandardCharsets.UTF_8);
		} catch (Exception exception) {
			throw new IllegalStateException("Unable to decrypt value.", exception);
		}
	}

	private byte[] deriveKey(String secret) {
		if (secret == null || secret.isBlank()) {
			throw new IllegalArgumentException("AES secret must not be blank.");
		}

		try {
			return MessageDigest.getInstance("SHA-256")
				.digest(secret.getBytes(StandardCharsets.UTF_8));
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 algorithm is unavailable.", exception);
		}
	}
}
