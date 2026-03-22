package com.aurelia.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final Key signingKey;
	private final long jwtExpirationMillis;

	public JwtService(
		@Value("${jwt.secret}") String jwtSecret,
		@Value("${jwt.expiration}") long jwtExpirationMillis
	) {
		this.signingKey = createSigningKey(jwtSecret);
		this.jwtExpirationMillis = jwtExpirationMillis;
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public String extractRole(String token) {
		return extractAllClaims(token).get("role", String.class);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public String generateToken(UserDetails userDetails) {
		String role = userDetails.getAuthorities()
			.stream()
			.map(GrantedAuthority::getAuthority)
			.findFirst()
			.orElse("ROLE_CUSTOMER");

		return generateToken(Map.of("role", role), userDetails);
	}

	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		Date issuedAt = new Date();
		Date expiration = new Date(issuedAt.getTime() + jwtExpirationMillis);

		return Jwts.builder()
			.claims(extraClaims)
			.subject(userDetails.getUsername())
			.issuedAt(issuedAt)
			.expiration(expiration)
			.signWith(signingKey)
			.compact();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		String username = extractUsername(token);
		return username != null
			&& username.equals(userDetails.getUsername())
			&& !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		Date expiration = extractClaim(token, Claims::getExpiration);
		return expiration.before(new Date());
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser()
			.verifyWith((javax.crypto.SecretKey) signingKey)
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}

	private Key createSigningKey(String jwtSecret) {
		try {
			byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
			if (keyBytes.length >= 32) {
				return Keys.hmacShaKeyFor(keyBytes);
			}
		} catch (RuntimeException exception) {
			// Fall back to the raw secret string below when it is not valid Base64.
		}

		byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

		if (keyBytes.length < 32) {
			throw new IllegalArgumentException(
				"JWT secret must be at least 32 bytes or a valid Base64-encoded key."
			);
		}

		return new SecretKeySpec(keyBytes, "HmacSHA256");
	}
}
