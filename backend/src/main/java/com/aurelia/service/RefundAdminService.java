package com.aurelia.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.AdminRefundRequestResponseDto;
import com.aurelia.dto.OrderItemResponseDto;
import com.aurelia.model.Book;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.OrderRepository;

@Service
public class RefundAdminService {

	private final BookRepository bookRepository;
	private final OrderRepository orderRepository;

	public RefundAdminService(BookRepository bookRepository, OrderRepository orderRepository) {
		this.bookRepository = bookRepository;
		this.orderRepository = orderRepository;
	}

	@Transactional(readOnly = true)
	public List<AdminRefundRequestResponseDto> getPendingRefunds() {
		return orderRepository.findAllByStatusOrderByRefundRequestedAtDescIdDesc(OrderStatus.REFUND_REQUESTED)
			.stream()
			.map(this::mapRefundRequest)
			.toList();
	}

	@Transactional
	public AdminRefundRequestResponseDto approveRefund(Long orderId) {
		Order order = findPendingRefund(orderId);
		restoreStock(order);
		order.setStatus(OrderStatus.REFUNDED);
		Order savedOrder = orderRepository.saveAndFlush(order);

		return mapRefundRequest(savedOrder);
	}

	@Transactional
	public AdminRefundRequestResponseDto rejectRefund(Long orderId) {
		Order order = findPendingRefund(orderId);
		order.setStatus(OrderStatus.DELIVERED);
		order.setRefundRequestedAt(null);
		Order savedOrder = orderRepository.saveAndFlush(order);

		return mapRefundRequest(savedOrder);
	}

	private Order findPendingRefund(Long orderId) {
		Order order = orderRepository.findById(orderId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

		if (order.getStatus() != OrderStatus.REFUND_REQUESTED) {
			throw new ResponseStatusException(
				HttpStatus.CONFLICT,
				"Only refund-requested orders can be processed here."
			);
		}

		return order;
	}

	private AdminRefundRequestResponseDto mapRefundRequest(Order order) {
		List<OrderItemResponseDto> items = order.getItems().stream()
			.map(item -> new OrderItemResponseDto(
				item.getBook().getId(),
				item.getBook().getTitle(),
				item.getBook().getAuthor(),
				item.getBook().getCoverColor(),
				item.getQuantity(),
				item.getUnitPrice(),
				item.getDiscountApplied(),
				item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
			))
			.toList();

		return new AdminRefundRequestResponseDto(
			order.getId(),
			order.getCustomer().getName(),
			order.getCustomer().getEmail(),
			order.getShippingAddress(),
			order.getStatus().name(),
			order.getTotalPrice(),
			order.getTotalPrice(),
			order.getCreatedAt(),
			order.getDeliveredAt(),
			order.getRefundRequestedAt(),
			items
		);
	}

	private void restoreStock(Order order) {
		Map<Long, Book> booksToRestore = new HashMap<>();

		for (OrderItem item : order.getItems()) {
			Book book = item.getBook();
			book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
			booksToRestore.put(book.getId(), book);
		}

		bookRepository.saveAll(booksToRestore.values());
		bookRepository.flush();
	}
}
