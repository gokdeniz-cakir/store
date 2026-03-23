CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users (id),
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN (
        'PROCESSING',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED',
        'REFUND_REQUESTED',
        'REFUNDED'
    )),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES books (id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_applied NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE credit_cards (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users (id),
    card_number_encrypted TEXT NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    expiry_month SMALLINT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_book_id ON order_items (book_id);
CREATE INDEX idx_credit_cards_customer_id ON credit_cards (customer_id);
