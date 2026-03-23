package com.aurelia.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String author;

	@Column(nullable = false, unique = true, length = 13)
	private String isbn;

	@Column(nullable = false)
	private String edition;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "stock_quantity", nullable = false)
	private Integer stockQuantity;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Column(name = "original_price", precision = 12, scale = 2)
	private BigDecimal originalPrice;

	@Column(name = "return_policy")
	private String returnPolicy;

	@Column(nullable = false)
	private String publisher;

	@Column(name = "page_count")
	private Integer pageCount;

	@Column(length = 64)
	private String language;

	@Column(name = "publication_year")
	private Integer publicationYear;

	@Column(name = "cover_image_url", length = 500)
	private String coverImageUrl;

	@Column(name = "cover_color", nullable = false, length = 7)
	private String coverColor;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private Category category;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Version
	@Column(nullable = false)
	private Long version;
}
