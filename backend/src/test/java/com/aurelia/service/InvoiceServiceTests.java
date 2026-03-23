package com.aurelia.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.aurelia.model.Book;
import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.aurelia.model.OrderStatus;
import com.aurelia.model.User;
import com.aurelia.model.UserRole;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;

class InvoiceServiceTests {

	private final InvoiceService invoiceService = new InvoiceService();

	@Test
	void generateInvoicePdfIncludesOrderAndCustomerDetails() throws IOException {
		User customer = User.builder()
			.id(7L)
			.name("Ada Lovelace")
			.email("ada@aurelia.com")
			.taxId("TR-445566")
			.homeAddress("Beyoglu, Istanbul")
			.role(UserRole.CUSTOMER)
			.build();

		Book firstBook = Book.builder()
			.id(11L)
			.title("The Moonstone")
			.author("Wilkie Collins")
			.build();
		Book secondBook = Book.builder()
			.id(12L)
			.title("Poems of the Sea")
			.author("Emily Hale")
			.build();

		Order order = Order.builder()
			.id(42L)
			.customer(customer)
			.status(OrderStatus.PROCESSING)
			.shippingAddress("19 Parchment Lane, Istanbul")
			.totalPrice(new BigDecimal("245.00"))
			.createdAt(Instant.parse("2026-03-23T10:15:30Z"))
			.items(List.of(
				OrderItem.builder()
					.order(null)
					.book(firstBook)
					.quantity(2)
					.unitPrice(new BigDecimal("95.00"))
					.discountApplied(new BigDecimal("10.00"))
					.build(),
				OrderItem.builder()
					.order(null)
					.book(secondBook)
					.quantity(1)
					.unitPrice(new BigDecimal("55.00"))
					.discountApplied(BigDecimal.ZERO)
					.build()
			))
			.build();

		byte[] invoicePdf = invoiceService.generateInvoicePdf(order);

		assertThat(invoicePdf).isNotEmpty();
		assertThat(extractText(invoicePdf))
			.contains("Invoice #42")
			.contains("Ada Lovelace")
			.contains("ada@aurelia.com")
			.contains("19 Parchment Lane, Istanbul")
			.contains("The Moonstone")
			.contains("Wilkie Collins")
			.contains("Poems of the Sea")
			.contains("Order Total: $245.00");
	}

	private String extractText(byte[] pdfBytes) throws IOException {
		PdfReader reader = new PdfReader(pdfBytes);
		try {
			StringBuilder text = new StringBuilder();
			int pageCount = reader.getNumberOfPages();
			PdfTextExtractor extractor = new PdfTextExtractor(reader);

			for (int page = 1; page <= pageCount; page++) {
				text.append(extractor.getTextFromPage(page));
			}

			return text.toString();
		} finally {
			reader.close();
		}
	}
}
