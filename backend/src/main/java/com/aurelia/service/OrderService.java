package com.aurelia.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.OrderItemResponseDto;
import com.aurelia.dto.OrderResponseDto;
import com.aurelia.dto.PlaceOrderRequestDto;
import com.aurelia.model.Book;
import com.aurelia.model.CreditCard;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.model.User;
import com.aurelia.repository.BookRepository;
import com.aurelia.repository.CreditCardRepository;
import com.aurelia.repository.OrderRepository;
import com.aurelia.repository.UserRepository;
import com.aurelia.util.AesEncryptionUtil;

import jakarta.transaction.Transactional;

@Service
public class OrderService {

	private static final int MAX_ORDER_RETRY_ATTEMPTS = 3;

	private final AesEncryptionUtil aesEncryptionUtil;
	private final BookRepository bookRepository;
	private final CreditCardRepository creditCardRepository;
	private final OrderRepository orderRepository;
	private final TransactionTemplate transactionTemplate;
	private final UserRepository userRepository;

	public OrderService(
		AesEncryptionUtil aesEncryptionUtil,
		BookRepository bookRepository,
		CreditCardRepository creditCardRepository,
		OrderRepository orderRepository,
		PlatformTransactionManager transactionManager,
		UserRepository userRepository
	) {
		this.aesEncryptionUtil = aesEncryptionUtil;
		this.bookRepository = bookRepository;
		this.creditCardRepository = creditCardRepository;
		this.orderRepository = orderRepository;
		this.userRepository = userRepository;
		this.transactionTemplate = new TransactionTemplate(transactionManager);
		this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
	}

	public OrderResponseDto placeOrder(String customerEmail, PlaceOrderRequestDto request) {
		for (int attempt = 1; attempt <= MAX_ORDER_RETRY_ATTEMPTS; attempt++) {
			try {
				return transactionTemplate.execute(status -> placeOrderInTransaction(customerEmail, request));
			} catch (OptimisticLockingFailureException exception) {
				if (attempt == MAX_ORDER_RETRY_ATTEMPTS) {
					throw new ResponseStatusException(
						HttpStatus.CONFLICT,
						"The selected books were updated during checkout. Please review your cart and try again."
					);
				}
			}
		}

		throw new ResponseStatusException(
			HttpStatus.CONFLICT,
			"The selected books were updated during checkout. Please review your cart and try again."
		);
	}

	@Transactional
	public Page<OrderResponseDto> getOrders(String customerEmail, Pageable pageable) {
		User customer = findCustomer(customerEmail);
		return orderRepository.findByCustomerId(customer.getId(), pageable)
			.map(this::mapOrder);
	}

	@Transactional
	public OrderResponseDto getOrder(String customerEmail, Long orderId) {
		User customer = findCustomer(customerEmail);
		Order order = orderRepository.findByIdAndCustomerId(orderId, customer.getId())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

		return mapOrder(order);
	}

	private OrderResponseDto placeOrderInTransaction(String customerEmail, PlaceOrderRequestDto request) {
		User customer = findCustomer(customerEmail);
		validateUniqueBookIds(request);

		Map<Long, Book> booksById = loadBooks(request);
		BigDecimal totalPrice = BigDecimal.ZERO;

		Order order = Order.builder()
			.customer(customer)
			.totalPrice(BigDecimal.ZERO)
			.status(OrderStatus.PROCESSING)
			.shippingAddress(normalizeShippingAddress(request.shippingAddress()))
			.build();

		for (var itemRequest : request.items()) {
			Book book = booksById.get(itemRequest.bookId());

			if (book.getStockQuantity() < itemRequest.quantity()) {
				throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"Insufficient stock for '" + book.getTitle() + "'."
				);
			}

			book.setStockQuantity(book.getStockQuantity() - itemRequest.quantity());

			BigDecimal discountApplied = calculateDiscount(book);
			BigDecimal lineTotal = book.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
			totalPrice = totalPrice.add(lineTotal);

			order.getItems().add(OrderItem.builder()
				.order(order)
				.book(book)
				.quantity(itemRequest.quantity())
				.unitPrice(book.getPrice())
				.discountApplied(discountApplied)
				.build());
		}

		bookRepository.saveAll(booksById.values());
		bookRepository.flush();

		order.setTotalPrice(totalPrice);
		Order savedOrder = orderRepository.saveAndFlush(order);

		creditCardRepository.saveAndFlush(CreditCard.builder()
			.customer(customer)
			.cardNumberEncrypted(aesEncryptionUtil.encrypt(request.creditCard().cardNumber()))
			.cardholderName(request.creditCard().cardholderName().trim())
			.expiryMonth(request.creditCard().expiryMonth())
			.expiryYear(request.creditCard().expiryYear())
			.build());

		return mapOrder(savedOrder);
	}

	private BigDecimal calculateDiscount(Book book) {
		if (book.getOriginalPrice() == null || book.getOriginalPrice().compareTo(book.getPrice()) <= 0) {
			return BigDecimal.ZERO;
		}

		return book.getOriginalPrice().subtract(book.getPrice());
	}

	private User findCustomer(String customerEmail) {
		return userRepository.findByEmail(normalizeEmail(customerEmail))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer not found."));
	}

	private Map<Long, Book> loadBooks(PlaceOrderRequestDto request) {
		List<Long> bookIds = request.items().stream()
			.map(item -> item.bookId())
			.toList();

		List<Book> books = bookRepository.findAllByIdIn(bookIds);

		if (books.size() != bookIds.size()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more books could not be found.");
		}

		Map<Long, Book> booksById = new HashMap<>();
		for (Book book : books) {
			booksById.put(book.getId(), book);
		}

		return booksById;
	}

	private OrderResponseDto mapOrder(Order order) {
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

		return new OrderResponseDto(
			order.getId(),
			order.getTotalPrice(),
			order.getStatus().name(),
			order.getShippingAddress(),
			items,
			order.getCreatedAt(),
			order.getUpdatedAt()
		);
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String normalizeShippingAddress(String shippingAddress) {
		String trimmedAddress = shippingAddress.trim();

		if (trimmedAddress.isEmpty()) {
			throw new IllegalArgumentException("shippingAddress must not be blank");
		}

		return trimmedAddress;
	}

	private void validateUniqueBookIds(PlaceOrderRequestDto request) {
		Set<Long> bookIds = new HashSet<>();

		for (var item : request.items()) {
			if (!bookIds.add(item.bookId())) {
				throw new IllegalArgumentException("items must not contain duplicate bookId values");
			}
		}
	}
}
