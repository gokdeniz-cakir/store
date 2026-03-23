package com.aurelia.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.aurelia.dto.AdminInvoiceResponseDto;
import com.aurelia.dto.RevenueAnalyticsResponseDto;
import com.aurelia.dto.RevenueBreakdownPointDto;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.repository.OrderRepository;

@Service
public class SalesAnalyticsService {

	private static final DateTimeFormatter BREAKDOWN_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");

	private final OrderRepository orderRepository;

	public SalesAnalyticsService(OrderRepository orderRepository) {
		this.orderRepository = orderRepository;
	}

	@Transactional(readOnly = true)
	public List<AdminInvoiceResponseDto> getInvoices(LocalDate startDate, LocalDate endDate) {
		validateDateRange(startDate, endDate);

		return findOrders(startDate, endDate).stream()
			.map(this::mapInvoice)
			.toList();
	}

	@Transactional(readOnly = true)
	public RevenueAnalyticsResponseDto getRevenueAnalytics(LocalDate startDate, LocalDate endDate) {
		validateDateRange(startDate, endDate);

		List<Order> orders = findOrders(startDate, endDate).stream()
			.filter(this::countsTowardRevenue)
			.toList();

		Map<LocalDate, RevenueAccumulator> breakdownAccumulators = new LinkedHashMap<>();
		startDate.datesUntil(endDate.plusDays(1))
			.forEach(date -> breakdownAccumulators.put(date, new RevenueAccumulator()));

		RevenueAccumulator totals = new RevenueAccumulator();
		for (Order order : orders) {
			LocalDate breakdownDate = order.getCreatedAt()
				.atOffset(ZoneOffset.UTC)
				.toLocalDate();
			RevenueAccumulator breakdown = breakdownAccumulators.computeIfAbsent(
				breakdownDate,
				ignored -> new RevenueAccumulator()
			);

			BigDecimal orderRevenue = calculateGrossRevenue(order);
			BigDecimal orderProfit = order.getTotalPrice();
			BigDecimal orderDiscount = calculateDiscountTotal(order);

			totals.add(orderRevenue, orderProfit, orderDiscount);
			breakdown.add(orderRevenue, orderProfit, orderDiscount);
		}

		List<RevenueBreakdownPointDto> breakdown = breakdownAccumulators.entrySet().stream()
			.map(entry -> new RevenueBreakdownPointDto(
				entry.getKey(),
				BREAKDOWN_LABEL_FORMATTER.format(entry.getKey()),
				entry.getValue().revenue(),
				entry.getValue().profit(),
				entry.getValue().orderCount()
			))
			.toList();

		return new RevenueAnalyticsResponseDto(
			startDate,
			endDate,
			totals.revenue(),
			totals.profit(),
			totals.discountTotal(),
			totals.orderCount(),
			breakdown
		);
	}

	private List<Order> findOrders(LocalDate startDate, LocalDate endDate) {
		return orderRepository.findAllByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDescIdDesc(
			toInstant(startDate),
			toInstant(endDate.plusDays(1))
		);
	}

	private AdminInvoiceResponseDto mapInvoice(Order order) {
		return new AdminInvoiceResponseDto(
			order.getId(),
			"INV-" + order.getId(),
			order.getCustomer().getName(),
			order.getCustomer().getEmail(),
			order.getStatus().name(),
			order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
			order.getTotalPrice(),
			calculateDiscountTotal(order),
			order.getCreatedAt()
		);
	}

	private boolean countsTowardRevenue(Order order) {
		return order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.REFUNDED;
	}

	private BigDecimal calculateGrossRevenue(Order order) {
		return order.getItems().stream()
			.map(item -> item.getUnitPrice()
				.add(item.getDiscountApplied())
				.multiply(BigDecimal.valueOf(item.getQuantity())))
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private BigDecimal calculateDiscountTotal(Order order) {
		return order.getItems().stream()
			.map(item -> item.getDiscountApplied().multiply(BigDecimal.valueOf(item.getQuantity())))
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private Instant toInstant(LocalDate date) {
		return date.atStartOfDay().toInstant(ZoneOffset.UTC);
	}

	private void validateDateRange(LocalDate startDate, LocalDate endDate) {
		if (endDate.isBefore(startDate)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endDate must be on or after startDate.");
		}
	}

	private static final class RevenueAccumulator {

		private BigDecimal revenue = BigDecimal.ZERO;
		private BigDecimal profit = BigDecimal.ZERO;
		private BigDecimal discountTotal = BigDecimal.ZERO;
		private long orderCount = 0;

		void add(BigDecimal revenueToAdd, BigDecimal profitToAdd, BigDecimal discountToAdd) {
			revenue = revenue.add(revenueToAdd);
			profit = profit.add(profitToAdd);
			discountTotal = discountTotal.add(discountToAdd);
			orderCount++;
		}

		BigDecimal revenue() {
			return revenue;
		}

		BigDecimal profit() {
			return profit;
		}

		BigDecimal discountTotal() {
			return discountTotal;
		}

		long orderCount() {
			return orderCount;
		}
	}
}
