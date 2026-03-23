package com.aurelia.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.aurelia.model.Order;
import com.aurelia.model.OrderItem;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class InvoiceService {

	private static final DateTimeFormatter INVOICE_DATE_FORMATTER = DateTimeFormatter
		.ofPattern("dd MMM uuuu HH:mm 'UTC'", Locale.US)
		.withZone(ZoneOffset.UTC);

	public byte[] generateInvoicePdf(Order order) {
		Objects.requireNonNull(order, "order must not be null");
		Objects.requireNonNull(order.getCustomer(), "order.customer must not be null");
		Objects.requireNonNull(order.getItems(), "order.items must not be null");

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4, 36, 36, 48, 36);
			PdfWriter.getInstance(document, outputStream);
			document.open();

			addHeader(document, order);
			addCustomerSection(document, order);
			addItemsTable(document, order);
			addTotals(document, order);

			document.close();
			return outputStream.toByteArray();
		} catch (DocumentException | IOException exception) {
			throw new IllegalStateException("Failed to generate invoice PDF.", exception);
		}
	}

	private void addHeader(Document document, Order order) throws DocumentException {
		Paragraph eyebrow = new Paragraph(
			"AURELIA EDITIONS",
			FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.NORMAL)
		);
		eyebrow.setSpacingAfter(8);
		document.add(eyebrow);

		Paragraph title = new Paragraph(
			"Invoice #" + order.getId(),
			FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.NORMAL)
		);
		title.setSpacingAfter(4);
		document.add(title);

		String issuedAt = order.getCreatedAt() == null
			? "Pending"
			: INVOICE_DATE_FORMATTER.format(order.getCreatedAt());
		Paragraph metadata = new Paragraph(
			"Issued: " + issuedAt + "\nStatus: " + order.getStatus().name().replace('_', ' '),
			FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL)
		);
		metadata.setSpacingAfter(18);
		document.add(metadata);
	}

	private void addCustomerSection(Document document, Order order) throws DocumentException {
		document.add(sectionHeading("Customer"));
		document.add(sectionBody(
			order.getCustomer().getName(),
			order.getCustomer().getEmail(),
			"Shipping Address: " + order.getShippingAddress()
		));

		if (order.getCustomer().getTaxId() != null && !order.getCustomer().getTaxId().isBlank()) {
			document.add(sectionBody("Tax ID: " + order.getCustomer().getTaxId().trim()));
		}

		if (order.getCustomer().getHomeAddress() != null && !order.getCustomer().getHomeAddress().isBlank()) {
			document.add(sectionBody("Home Address: " + order.getCustomer().getHomeAddress().trim()));
		}
	}

	private void addItemsTable(Document document, Order order) throws DocumentException {
		document.add(sectionHeading("Books"));

		PdfPTable table = new PdfPTable(new float[] { 3.4f, 0.9f, 1.2f, 1.2f, 1.3f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(6);
		table.setSpacingAfter(16);

		table.addCell(headerCell("Book"));
		table.addCell(headerCell("Qty"));
		table.addCell(headerCell("Unit"));
		table.addCell(headerCell("Discount"));
		table.addCell(headerCell("Subtotal"));

		for (OrderItem item : order.getItems()) {
			BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
			BigDecimal discountTotal = item.getDiscountApplied().multiply(BigDecimal.valueOf(item.getQuantity()));
			String bookLabel = item.getBook().getTitle() + "\n" + item.getBook().getAuthor();

			table.addCell(bodyCell(bookLabel, Element.ALIGN_LEFT));
			table.addCell(bodyCell(String.valueOf(item.getQuantity()), Element.ALIGN_CENTER));
			table.addCell(bodyCell(formatCurrency(item.getUnitPrice()), Element.ALIGN_RIGHT));
			table.addCell(bodyCell(formatCurrency(discountTotal), Element.ALIGN_RIGHT));
			table.addCell(bodyCell(formatCurrency(subtotal), Element.ALIGN_RIGHT));
		}

		document.add(table);
	}

	private void addTotals(Document document, Order order) throws DocumentException {
		Paragraph total = new Paragraph(
			"Order Total: " + formatCurrency(order.getTotalPrice()),
			FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.NORMAL)
		);
		total.setAlignment(Element.ALIGN_RIGHT);
		document.add(total);
	}

	private Paragraph sectionHeading(String value) {
		Paragraph paragraph = new Paragraph(
			value,
			FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.NORMAL)
		);
		paragraph.setSpacingBefore(8);
		paragraph.setSpacingAfter(6);
		return paragraph;
	}

	private Paragraph sectionBody(String... lines) {
		Paragraph paragraph = new Paragraph(
			String.join("\n", lines),
			FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL)
		);
		paragraph.setSpacingAfter(6);
		return paragraph;
	}

	private PdfPCell headerCell(String value) {
		PdfPCell cell = new PdfPCell(new Phrase(
			value,
			FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL)
		));
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell.setPadding(8);
		return cell;
	}

	private PdfPCell bodyCell(String value, int alignment) {
		PdfPCell cell = new PdfPCell(new Phrase(
			value,
			FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL)
		));
		cell.setHorizontalAlignment(alignment);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		cell.setPadding(8);
		return cell;
	}

	private String formatCurrency(BigDecimal value) {
		return "$" + value.setScale(2, java.math.RoundingMode.HALF_UP);
	}
}
