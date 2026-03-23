CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(100) NOT NULL
);

CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) NOT NULL UNIQUE,
    edition VARCHAR(255) NOT NULL,
    description TEXT,
    stock_quantity INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    return_policy VARCHAR(255),
    publisher VARCHAR(255) NOT NULL,
    page_count INTEGER,
    language VARCHAR(64),
    publication_year INTEGER,
    cover_image_url VARCHAR(500),
    cover_color VARCHAR(7) NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories (id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_books_category_id ON books (category_id);
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);
