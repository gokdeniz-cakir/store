package com.aurelia.service;

import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aurelia.model.Order;
import com.aurelia.repository.OrderRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

	private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

	private final boolean mailEnabled;
	private final String mailFrom;
	private final InvoiceService invoiceService;
	private final JavaMailSender mailSender;
	private final OrderRepository orderRepository;

	public EmailService(
		@Value("${app.mail.enabled:false}") boolean mailEnabled,
		@Value("${app.mail.from:no-reply@aurelia.local}") String mailFrom,
		InvoiceService invoiceService,
		JavaMailSender mailSender,
		OrderRepository orderRepository
	) {
		this.mailEnabled = mailEnabled;
		this.mailFrom = mailFrom;
		this.invoiceService = invoiceService;
		this.mailSender = mailSender;
		this.orderRepository = orderRepository;
	}

	@Async
	@Transactional(readOnly = true)
	public void sendOrderInvoiceEmail(Long orderId) {
		Order order = orderRepository.findById(orderId)
			.orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

		byte[] invoicePdf = invoiceService.generateInvoicePdf(order);

		if (!mailEnabled) {
			LOGGER.info("Mail delivery disabled. Skipping invoice email for order {}.", orderId);
			return;
		}

		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(
				message,
				true,
				StandardCharsets.UTF_8.name()
			);
			helper.setFrom(mailFrom);
			helper.setTo(order.getCustomer().getEmail());
			helper.setSubject("Your Aurelia Editions invoice #" + order.getId());
			helper.setText(buildEmailBody(order), false);
			helper.addAttachment(
				"aurelia-order-" + order.getId() + "-invoice.pdf",
				new ByteArrayResource(invoicePdf),
				"application/pdf"
			);

			mailSender.send(message);
		} catch (MailException | MessagingException exception) {
			LOGGER.warn("Failed to send invoice email for order {}.", orderId, exception);
		}
	}

	private String buildEmailBody(Order order) {
		return """
			Dear %s,

			Thank you for your Aurelia Editions order. Your invoice is attached to this email.

			Order ID: %d
			Status: %s
			Shipping Address: %s

			Kind regards,
			Aurelia Editions
			"""
			.formatted(
				order.getCustomer().getName(),
				order.getId(),
				order.getStatus().name().replace('_', ' '),
				order.getShippingAddress()
			);
	}
}
