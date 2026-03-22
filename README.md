# Aurelia Editions — Fine Books & Collections

An online bookstore for fine, collectible, and limited-edition books. Full-stack e-commerce platform built as a university course project.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite, TypeScript), Tailwind CSS, Phosphor Icons |
| Backend | Java 17+, Spring Boot, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | JWT (stateless) |
| PDF | OpenPDF |
| Email | Spring Mail (SMTP) |
| Migrations | Flyway |

## Features

**Customers** can browse books by category, search by title/author/description, sort by price or popularity, manage a shopping cart without logging in, place orders with credit card payment, receive PDF invoices via email, track delivery status (Processing → In Transit → Delivered), rate and review books, manage a wishlist, receive discount notifications, cancel orders, and request refunds within 30 days.

**Product Managers** can add/remove books and categories, manage stock levels, process deliveries and update order statuses, and moderate customer reviews (approve/reject before public visibility).

**Sales Managers** can set discount campaigns on selected books (with automatic notifications to users who wishlisted those books), view and export invoices for any date range, and view revenue/profit analytics with charts.

## Design

The storefront follows the **Aurelia Editions** design language: a warm parchment palette with dark ink text, crimson and gold accents, Playfair Display serif headings, Inter sans-serif body text, sharp rectangular buttons, and CSS-rendered book covers with spine effects. The reference design is in `frontend/public/design-reference.html`.

## Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- PostgreSQL 14+
- Maven 3.8+

## Getting Started

### 1. Database Setup

```bash
psql -U postgres
CREATE DATABASE aurelia_editions;
CREATE USER aurelia_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aurelia_editions TO aurelia_user;
\q
```

### 2. Backend

```bash
cd backend

# Edit with your DB credentials, JWT secret, and SMTP settings

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API available at `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

App available at `http://localhost:5173`.

## Project Structure

```
aurelia-editions/
├── frontend/
│   ├── src/
│   │   ├── components/      # BookCard, StarRating, Layout, etc.
│   │   ├── pages/           # Home, BookListing, BookDetail, Cart, Checkout, Admin...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # bookService, orderService, authService...
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helpers
│   └── public/
│       └── design-reference.html
├── backend/
│   ├── src/main/java/com/aurelia/
│   │   ├── config/          # Security, CORS
│   │   ├── controller/      # REST endpoints
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access (JPA)
│   │   ├── model/           # Book, Order, User, Review...
│   │   ├── dto/             # Request/response objects
│   │   ├── security/        # JWT, filters
│   │   └── exception/       # Error handling
│   └── pom.xml
├── AGENTS.md                # AI agent development guidelines
├── plan.md                  # Task roadmap (44 tasks, 8 phases)
└── README.md
```

## Default Accounts (Development)

After running seed migrations:

| Role | Email | Password |
|------|-------|----------|
| Sales Manager | sales@aurelia.com | (set in seed migration) |
| Product Manager | pm@aurelia.com | (set in seed migration) |

Register via the storefront to create customer accounts.

## Environment Variables

Backend (`application-dev.properties`):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/aurelia_editions
spring.datasource.username=aurelia_user
spring.datasource.password=your_password

jwt.secret=your-256-bit-secret
jwt.expiration=86400000

spring.mail.host=smtp.mailtrap.io
spring.mail.port=587
spring.mail.username=your_mailtrap_user
spring.mail.password=your_mailtrap_pass
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Customer registration |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/books | No | Browse/search/sort books |
| GET | /api/books/{id} | No | Book detail |
| GET | /api/categories | No | List categories |
| POST | /api/orders | Customer | Place order |
| GET | /api/orders | Customer | Order history |
| GET | /api/orders/{id}/invoice | Customer/SM | Download invoice PDF |
| POST | /api/books/{id}/reviews | Customer | Add review |
| POST/DELETE | /api/wishlist/{bookId} | Customer | Manage wishlist |
| GET | /api/admin/deliveries | PM | Delivery list |
| PATCH | /api/admin/deliveries/{id}/status | PM | Update delivery status |
| POST | /api/admin/discounts | SM | Apply discounts |
| GET | /api/admin/invoices | SM | Query invoices by date |
| GET | /api/admin/revenue | SM | Revenue analytics |

*SM = Sales Manager, PM = Product Manager*

## Development Notes

- See `AGENTS.md` for coding standards, architecture rules, and the full design system specification.
- See `plan.md` for the 44-task roadmap with checkboxes. Check off tasks as completed.
- The domain entity is `Book`, not `Product`. Spec fields are mapped to book-appropriate names (see AGENTS.md).
- Stock management uses optimistic locking (`@Version`) to handle concurrent purchases.
- Passwords are BCrypt hashed. Credit card numbers are AES encrypted at rest.
- Book covers are rendered with CSS (colored background + spine shadow + decorative border), not images.

## License

University course project. Not licensed for commercial use.
