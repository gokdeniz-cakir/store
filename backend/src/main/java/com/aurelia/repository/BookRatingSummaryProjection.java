package com.aurelia.repository;

public interface BookRatingSummaryProjection {

	Long getBookId();

	Double getAverageRating();

	Long getReviewCount();
}
