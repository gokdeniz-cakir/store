package com.aurelia.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.AdminDeliveryResponseDto;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.repository.OrderItemRepository;
import com.aurelia.repository.OrderRepository;

@Service
public class DeliveryService {

	private final OrderItemRepository orderItemRepository;
	private final OrderRepository orderRepository;

	public DeliveryService(OrderItemRepository orderItemRepository, OrderRepository orderRepository) {
		this.orderItemRepository = orderItemRepository;
		this.orderRepository = orderRepository;
	}

	@Transactional(readOnly = true)
	public List<AdminDeliveryResponseDto> getDeliveries() {
		return orderItemRepository.findAllByOrderByOrderCreatedAtDescIdDesc().stream()
			.map(this::mapDelivery)
			.toList();
	}

	@Transactional
	public AdminDeliveryResponseDto updateDeliveryStatus(Long deliveryId, String requestedStatus) {
		OrderItem delivery = orderItemRepository.findWithOrderAndCustomerById(deliveryId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found."));

		Order order = delivery.getOrder();
		OrderStatus nextStatus = parseStatus(requestedStatus);

		if (!isAllowedTransition(order.getStatus(), nextStatus)) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"Delivery status can only advance from PROCESSING to IN_TRANSIT to DELIVERED."
			);
		}

		order.setStatus(nextStatus);
		Order savedOrder = orderRepository.save(order);
		delivery.setOrder(savedOrder);

		return mapDelivery(delivery);
	}

	private boolean isAllowedTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
		return switch (currentStatus) {
			case PROCESSING -> nextStatus == OrderStatus.IN_TRANSIT;
			case IN_TRANSIT -> nextStatus == OrderStatus.DELIVERED;
			default -> false;
		};
	}

	private AdminDeliveryResponseDto mapDelivery(OrderItem orderItem) {
		Order order = orderItem.getOrder();

		return new AdminDeliveryResponseDto(
			orderItem.getId(),
			order.getId(),
			orderItem.getBook().getId(),
			orderItem.getBook().getTitle(),
			order.getCustomer().getName(),
			order.getCustomer().getEmail(),
			orderItem.getQuantity(),
			orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())),
			order.getShippingAddress(),
			order.getStatus().name(),
			order.getCreatedAt(),
			order.getUpdatedAt()
		);
	}

	private OrderStatus parseStatus(String rawStatus) {
		try {
			return OrderStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported delivery status.");
		}
	}
}
