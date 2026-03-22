# AGENTS.md — AI Agent Guidelines for Aurelia Editions

## Project Overview

You are building **Aurelia Editions**, an online bookstore for fine and collectible books. The application is a full-stack e-commerce platform.

- **Frontend:** React (Vite, TypeScript, Tailwind CSS)
- **Backend:** Java Spring Boot (Maven, Java 17+)
- **Database:** PostgreSQL
- **Auth:** JWT-based authentication with role-based access control

Read `plan.md` for the full task breakdown. Each task ends with a commit.

---

## Commit Discipline

- **One commit per completed task** from `plan.md`. Mark the task ID in the commit message.
- Format: `[TASK-ID] Short description of what was done`
  - Example: `[P1-T3] Add Book and Category JPA entities with Flyway migration`
- Every commit should leave the application in a runnable state.

---

## Repository Structure

```
aurelia-editions/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (BookCard, StarRating, etc.)
│   │   ├── pages/            # Route-level page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API call functions (axios instances)
│   │   ├── context/          # React context providers (Auth, Cart)
│   │   ├── types/            # TypeScript interfaces/types
│   │   └── utils/            # Helper functions
│   ├── public/
│   │   └── design-reference.html   # The original design mockup (keep for reference)
│   └── package.json
├── backend/
│   ├── src/main/java/com/aurelia/
│   │   ├── config/           # Security, CORS, app config
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── model/            # JPA entities
│   │   ├── dto/              # Request/response DTOs
│   │   ├── security/         # JWT filters, auth providers
│   │   ├── exception/        # Custom exceptions + global handler
│   │   └── util/             # Utility classes (encryption, PDF, etc.)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-dev.properties
│   └── pom.xml
├── AGENTS.md
├── plan.md
└── README.md
```

Do not deviate from this structure without justification. If you create a new directory, document why in the commit message.

---

## Design System — Aurelia Editions

The reference design is in `frontend/public/design-reference.html`. This is the visual foundation. Every page you build must feel like it belongs in the same store.

### Fonts

- **Serif (headings, book titles, display text):** Playfair Display (weights: 400, 500, 600, 700; italic: 400, 600)
- **Sans-serif (body, UI, navigation, labels):** Inter (weights: 300, 400, 500, 600)

Load via Google Fonts. Configure in Tailwind as `font-serif` and `font-sans`.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `parchment-50` | `#fcfbf8` | Page background |
| `parchment-100` | `#f5f4ef` | Section backgrounds, cards |
| `parchment-200` | `#e8e5dc` | Borders, dividers |
| `parchment-300` | `#d8d2c4` | Muted accents |
| `ink-900` | `#1c1917` | Primary text, dark sections |
| `ink-800` | `#292524` | Secondary text |
| `ink-500` | `#78716c` | Muted text, descriptions |
| `crimson-700` | `#7a2222` | Accent (hover states, badges, CTA highlights) |
| `crimson-800` | `#5c1717` | Darker accent |
| `gold-500` | `#c5a059` | Premium accents, labels, decorative elements |
| `gold-600` | `#a38241` | Gold hover/pressed state |

Extend these in `tailwind.config.ts`. Do not introduce new accent colors without a strong reason.

### Visual Patterns

- **Book cards:** Use the `book-spine-left` effect (left border + inset shadow) and `book-shadow` (offset shadow). Books "lift" on hover (`group-hover:-translate-y-2`). The book cover is a colored rectangle with a decorative inner border, a Phosphor icon, and the title in serif uppercase tracking-wide.
- **Navigation:** Uppercase, `tracking-[0.15em]`, `text-[12px]`, underline-on-hover via `::after` pseudo-element.
- **Section headers:** Playfair Display, large (`text-4xl`), with a muted subtitle below. Sometimes preceded by a small uppercase label in `crimson-700` with extreme letter-spacing.
- **CTAs:** Rectangular (no border-radius), uppercase, `tracking-[0.15em]`, small text. Primary: `bg-ink-900 text-white hover:bg-crimson-700`. Secondary: `border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white`.
- **Icons:** Phosphor Icons (regular weight). Loaded via `@phosphor-icons/web` or `@phosphor-icons/react` in the React app.
- **Spacing:** Generous. Sections have `py-24`. Content areas max width `1440px` with `px-8`.
- **Footer:** Dark (`bg-[#111111]`), `border-t-4 border-crimson-700`, 4-column grid.
- **Announcement bar:** `bg-ink-900`, white text, `text-[11px]` uppercase tracking.

### What NOT to Do with the Design

- Do not use rounded corners on buttons or cards. The aesthetic is sharp and editorial.
- Do not use bright/saturated colors. The palette is warm, muted, and literary.
- Do not use emoji or playful icons. Phosphor icons only, regular weight.
- Do not override the font pairing. Playfair + Inter is the identity.
- Do not use generic Bootstrap/MUI component styling. Every component should match the reference.



## Backend Rules (Spring Boot)

### Architecture

Strict **Controller → Service → Repository** layering:

- **Controllers** handle HTTP only: parse request, validate via `@Valid`, delegate to service, return response. No business logic.
- **Services** contain all business logic. Use `@Transactional` where needed.
- **Repositories** extend `JpaRepository`. Use `@Query` for custom queries. Never return entities directly to controllers — map to DTOs in the service layer.

### Domain Model (Books, not Generic Products)

A "product" in this system is a **book**. The entity should be named `Book`, not `Product`. Required fields per the spec (mapped to the bookstore domain):

| Spec Field | Book Field | Notes |
|------------|-----------|-------|
| ID | `id` | UUID or Long |
| Name | `title` | |
| Model | `edition` | e.g., "Collector's Edition", "Paperback" |
| Serial Number | `isbn` | Use ISBN-13 format |
| Description | `description` | |
| Quantity in Stock | `stockQuantity` | |
| Price | `price` | BigDecimal |
| Warranty Status | `returnPolicy` | e.g., "30-day returns" |
| Distributor Info | `publisher` | Publisher name and info |

Additional book-specific fields: `author`, `pageCount`, `language`, `publicationYear`, `coverImageUrl`, `coverColor` (hex, for the CSS book-cover rendering).

### Database Migrations

- Use Flyway for all schema changes. Migration files in `src/main/resources/db/migration/` with format `V{number}__{description}.sql`.
- Never rely on `spring.jpa.hibernate.ddl-auto=update` beyond initial prototyping.

### Error Handling

- `@RestControllerAdvice` global exception handler from day one. Map to proper HTTP codes and a consistent `ErrorResponseDTO`.
- Custom exceptions: `ResourceNotFoundException`, `InsufficientStockException`, `UnauthorizedAccessException`, etc.
- Never let stack traces leak to the client.

### Security

- Spring Security with JWT. Three roles: `CUSTOMER`, `SALES_MANAGER`, `PRODUCT_MANAGER`.
- Protect endpoints with `@PreAuthorize` or `SecurityFilterChain`. Default deny.
- CORS must allow `http://localhost:5173` in development.
- Passwords: BCrypt. Credit card numbers: AES encryption. Never log sensitive fields.

### API Design

- RESTful: `GET /api/books`, `POST /api/orders`, `PATCH /api/orders/{id}/status`
- Plural nouns for resources.
- Pagination via Spring `Pageable` with `page`, `size`, `sort` params.
- Proper HTTP status codes: 201 created, 204 deleted, 400 validation, 401/403 auth, 404 not found, 409 conflict.

---

## Frontend Rules (React)

### General

- Functional components with hooks. No class components.
- TypeScript strict mode. Define interfaces for all API responses and component props.
- Use `axios` with a configured instance (base URL, JWT interceptor).

### State Management

- `AuthContext`: user, token, role, login/logout/register.
- `CartContext`: cart items stored in localStorage for guest users.
- `useState`/`useReducer` for local state. No Redux — Context is sufficient for this scope.

### Routing

- `react-router-dom` v6. `PrivateRoute` wrapper checking auth and role.
- Admin routes (`/admin/*`) require `SALES_MANAGER` or `PRODUCT_MANAGER`.

### API Calls

- Centralize in `services/`: `bookService.ts`, `orderService.ts`, `authService.ts`, etc.
- Handle loading, error, and empty states in every data-fetching component. Show skeletons, not blank screens.
- `try/catch` on all API calls. User-friendly error messages via toast.

### Styling

- **Tailwind CSS only.** Use the extended config with the Aurelia color tokens. Do not install a component library (no MUI, no Ant Design). Build components from scratch to match the reference design.
- Import Phosphor Icons via `@phosphor-icons/react` for the React app.

---

## Concurrency and Stock Management

- Stock decrements must be atomic. Use `@Version` (optimistic locking) on the `Book` entity.
- Do NOT decrement stock when adding to cart — only on confirmed order placement.
- If stock is insufficient at order time, reject with a clear error.

---

## PDF and Email

- Use OpenPDF or iText for invoice generation.
- Use Spring `JavaMailSender` with SMTP (Mailtrap for dev).
- Invoice content: order ID, date, customer info, itemized book list, quantities, prices, discounts applied, total.

---

## What to Avoid

- **No over-engineering.** Monolithic Spring Boot + React SPA. No microservices, no message queues.
- **No unnecessary dependencies.** If Tailwind + custom components can do it, don't install a UI library.
- **No `any` in TypeScript.** Define every type.
- **No hardcoded secrets.** Use env vars or `application-dev.properties` (gitignored).
- **No God classes.** Split services by domain if they grow past ~15 methods.
- **No skipping error handling.** Every endpoint, every fetch.

---

## Checklist Before Marking a Task Done

1. Code compiles with no errors.
2. No new warnings introduced (or documented with reason).
3. API endpoints return correct status codes and response bodies.
4. Frontend pages handle loading, error, and empty states.
5. UI matches the Aurelia design system (colors, fonts, spacing, sharp corners).
6. Sensitive data is not logged or exposed.
7. Commit message follows format and references the task ID.