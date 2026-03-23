CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reviews_book_customer UNIQUE (book_id, customer_id)
);

CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_wishlists_customer_book UNIQUE (customer_id, book_id)
);

CREATE INDEX idx_reviews_book_id ON reviews (book_id);
CREATE INDEX idx_reviews_customer_id ON reviews (customer_id);
CREATE INDEX idx_reviews_approved ON reviews (approved);
CREATE INDEX idx_wishlists_customer_id ON wishlists (customer_id);
CREATE INDEX idx_wishlists_book_id ON wishlists (book_id);
