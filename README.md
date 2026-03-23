# Aurelia Editions

Aurelia Editions is a full-stack bookstore for fine, collectible, and limited-edition books. The project includes a public storefront, customer ordering flow, reviews and wishlists, and separate admin tooling for sales and product managers.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Phosphor Icons, Recharts |
| Backend | Spring Boot 4, Spring Security, Spring Data JPA, Flyway, Java Mail |
| Database | PostgreSQL 17 |
| Auth | JWT with role-based access control |
| Documents | OpenPDF |

## Features

- Public catalog browsing with search, sorting, category filters, ratings, and detail pages.
- Customer registration/login, guest cart persistence, checkout, invoices, order history, cancellation, and refunds.
- Wishlist and discount notifications.
- Product-manager tools for books, categories, stock, delivery flow, and review moderation.
- Sales-manager tools for discounts, refunds, invoices, and revenue analytics.
- Security hardening for JWT-protected routes, BCrypt passwords, AES-encrypted card storage, and auth rate limiting.

## Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 17+

## Local Setup

### 1. Create the databases

```sql
CREATE USER aurelia_user WITH PASSWORD 'your_password';
CREATE DATABASE aurelia_editions OWNER aurelia_user;
CREATE DATABASE aurelia_editions_test OWNER aurelia_user;
```

### 2. Start the backend

PowerShell:

```powershell
cd backend

$env:AURELIA_DB_URL='jdbc:postgresql://localhost:5432/aurelia_editions'
$env:AURELIA_DB_USERNAME='aurelia_user'
$env:AURELIA_DB_PASSWORD='your_password'
$env:JWT_SECRET='abcdefghijklmnopqrstuvwxyz123456'

.\mvnw.cmd spring-boot:run
```

The backend runs on [http://localhost:8080](http://localhost:8080).

Useful endpoints:

- [http://localhost:8080/api/health](http://localhost:8080/api/health)
- [http://localhost:8080/api/books](http://localhost:8080/api/books)
- [http://localhost:8080/api/categories](http://localhost:8080/api/categories)

### 3. Start the frontend

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The storefront runs on [http://localhost:5173](http://localhost:5173).

## Environment Variables

### Backend

The dev profile reads these from `backend/src/main/resources/application-dev.properties`:

```properties
SERVER_PORT=8080

AURELIA_DB_URL=jdbc:postgresql://localhost:5432/aurelia_editions
AURELIA_DB_USERNAME=aurelia_user
AURELIA_DB_PASSWORD=your_password

JWT_SECRET=abcdefghijklmnopqrstuvwxyz123456
JWT_EXPIRATION=86400000

AURELIA_ALLOWED_ORIGINS=http://localhost:5173

AURELIA_MAIL_ENABLED=false
AURELIA_MAIL_FROM=no-reply@aurelia.local
AURELIA_SMTP_HOST=sandbox.smtp.mailtrap.io
AURELIA_SMTP_PORT=2525
AURELIA_SMTP_USERNAME=
AURELIA_SMTP_PASSWORD=
AURELIA_SMTP_AUTH=true
AURELIA_SMTP_STARTTLS_ENABLE=true

AURELIA_AUTH_RATE_LIMIT_MAX_ATTEMPTS=5
AURELIA_AUTH_RATE_LIMIT_WINDOW_SECONDS=60
```

Notes:

- `AURELIA_MAIL_ENABLED` is `false` by default. Invoice download works immediately, but email delivery requires SMTP settings plus `AURELIA_MAIL_ENABLED=true`.
- Do not put real secrets into tracked files. Use environment variables for local credentials.
- `.gitignore` already ignores `backend/src/main/resources/application-local.properties` if you want your own local override file.

### Frontend

Optional:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

## Seeded Accounts

The Flyway seed creates these manager emails:

- `sales.manager@aurelia.com`
- `product.manager@aurelia.com`

Important:

- The seed migration stores BCrypt hashes only.
- A fresh database does not contain a recoverable plaintext manager password.

If you want known local manager passwords for manual testing, you can reset both to `manager12345` with:

```sql
UPDATE users
SET password_hash = '$2a$10$kUuSCIvp34haYcrQFerdDOv0NrSA6cVuz3P/WJL5t7xvX88IAK17S'
WHERE email IN ('sales.manager@aurelia.com', 'product.manager@aurelia.com');
```

Customer accounts are created through the storefront at `/register`.

## Tests

Backend:

```powershell
cd backend

$env:AURELIA_DB_URL='jdbc:postgresql://localhost:5432/aurelia_editions_test'
$env:AURELIA_DB_USERNAME='aurelia_user'
$env:AURELIA_DB_PASSWORD='your_password'

.\mvnw.cmd test
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Smoke-Test Coverage

The current build was smoke-tested locally against the running app on March 23, 2026 for:

- health check
- catalog browse/search
- customer registration
- checkout and invoice download
- review submission
- order cancellation
- delivery progression to `DELIVERED`
- refund request and sales-manager approval

Invoice email delivery was not asserted in the smoke run because mail is disabled by default unless SMTP is configured.

## Project Structure

```text
store/
├── backend/
│   ├── src/main/java/com/aurelia/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── AGENTS.md
├── plan.md
└── README.md
```

## Notes

- The domain model is book-first: `Book`, not `Product`.
- Stock changes happen on confirmed order placement only.
- Customer card numbers are encrypted at rest with AES/GCM.
- Passwords are hashed with BCrypt.
- The storefront design follows the parchment/ink/crimson/gold Aurelia system from `frontend/public/design-reference.html`.
