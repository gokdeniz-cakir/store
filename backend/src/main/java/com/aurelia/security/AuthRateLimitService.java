package com.aurelia.security;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthRateLimitService {

	private final int maxAttempts;
	private final Duration window;
	private final Map<String, Deque<Instant>> attemptsByKey = new ConcurrentHashMap<>();

	public AuthRateLimitService(
		@Value("${app.auth.rate-limit.max-attempts:5}") int maxAttempts,
		@Value("${app.auth.rate-limit.window-seconds:60}") long windowSeconds
	) {
		this.maxAttempts = maxAttempts;
		this.window = Duration.ofSeconds(windowSeconds);
	}

	public boolean tryConsume(String key) {
		Deque<Instant> attempts = attemptsByKey.computeIfAbsent(key, ignored -> new ArrayDeque<>());
		Instant now = Instant.now();

		synchronized (attempts) {
			evictExpired(attempts, now);

			if (attempts.size() >= maxAttempts) {
				return false;
			}

			attempts.addLast(now);
			return true;
		}
	}

	public void clearAll() {
		attemptsByKey.clear();
	}

	private void evictExpired(Deque<Instant> attempts, Instant now) {
		while (!attempts.isEmpty() && attempts.peekFirst().plus(window).isBefore(now)) {
			attempts.removeFirst();
		}
	}
}
