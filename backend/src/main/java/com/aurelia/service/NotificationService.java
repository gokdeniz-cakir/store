package com.aurelia.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.NotificationResponseDto;
import com.aurelia.model.Notification;
import com.aurelia.model.User;
import com.aurelia.model.Wishlist;
import com.aurelia.repository.NotificationRepository;
import com.aurelia.repository.UserRepository;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationService(
		NotificationRepository notificationRepository,
		UserRepository userRepository
	) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public void createDiscountNotifications(List<Wishlist> wishlistEntries, int percentage) {
		if (wishlistEntries.isEmpty()) {
			return;
		}

		List<Notification> notifications = wishlistEntries.stream()
			.map(wishlist -> Notification.builder()
				.customer(wishlist.getCustomer())
				.book(wishlist.getBook())
				.message(buildDiscountMessage(wishlist, percentage))
				.read(false)
				.build())
			.toList();

		notificationRepository.saveAll(notifications);
	}

	@Transactional(readOnly = true)
	public List<NotificationResponseDto> getNotifications(String customerEmail) {
		User customer = findCustomer(customerEmail);

		return notificationRepository.findAllByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
			.map(this::mapNotification)
			.toList();
	}

	@Transactional
	public NotificationResponseDto markAsRead(String customerEmail, Long notificationId) {
		User customer = findCustomer(customerEmail);
		Notification notification = notificationRepository.findByIdAndCustomerId(notificationId, customer.getId())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));

		notification.setRead(true);
		return mapNotification(notificationRepository.save(notification));
	}

	private String buildDiscountMessage(Wishlist wishlist, int percentage) {
		return wishlist.getBook().getTitle() + " is now " + percentage
			+ "% off on Aurelia Editions.";
	}

	private NotificationResponseDto mapNotification(Notification notification) {
		return new NotificationResponseDto(
			notification.getId(),
			notification.getBook().getId(),
			notification.getBook().getTitle(),
			notification.getMessage(),
			notification.isRead(),
			notification.getCreatedAt()
		);
	}

	private User findCustomer(String customerEmail) {
		return userRepository.findByEmail(customerEmail.trim().toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer not found."));
	}
}
