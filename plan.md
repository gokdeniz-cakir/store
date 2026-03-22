# plan.md — Project Roadmap (Aurelia Editions)

Each task below should result in one commit upon completion. Mark tasks with `[x]` when done.

---

## Phase 1: Project Scaffolding & Infrastructure

> Goal: Both apps run locally, connect to the database, design system is established.

- [x] **P1-T1** — Initialize Spring Boot project (Java 17+, Spring Web, Data JPA, Security, PostgreSQL, Lombok, Validation, Flyway). Configure PostgreSQL connection in `application.properties` and `application-dev.properties`. Add `.gitignore`. Verify startup.
- [x] **P1-T2** — Initialize React app (Vite + TypeScript). Install `react-router-dom`, `axios`, `@phosphor-icons/react`. Configure Tailwind CSS with the Aurelia design tokens (parchment, ink, crimson, gold colors; Playfair Display + Inter fonts). Add the reference HTML to `public/design-reference.html`. Configure axios instance with base URL and interceptors.
- [x] **P1-T3** — Configure CORS in Spring Boot. Create `GET /api/health` endpoint. Set up global exception handler (`@RestControllerAdvice`) with `ErrorResponseDTO`. Verify frontend can call the health endpoint.
- [x] **P1-T4** — Build the shared layout shell from the reference design: announcement bar, header (logo, nav links, icon buttons for search/account/wishlist/cart with badge), footer (4-column grid, newsletter form, social links, legal links). This is the `Layout` component that wraps all pages.

---

## Phase 2: Authentication & User Management

> Goal: Users can register, log in, and receive JWTs. Role-based access works end-to-end.

- [x] **P2-T1** — Create Flyway migration for `users` table (id, name, email, password_hash, tax_id, home_address, role enum [CUSTOMER, SALES_MANAGER, PRODUCT_MANAGER], timestamps). Create `User` entity and `UserRepository`.
- [x] **P2-T2** — Implement JWT utility (generate, validate, parse with role claims). Implement `JwtAuthenticationFilter`. Configure `SecurityFilterChain`: permit public endpoints, require auth elsewhere, disable CSRF.
- [x] **P2-T3** — Implement `AuthService` and `AuthController`: `POST /api/auth/register` (customers only), `POST /api/auth/login`. BCrypt hashing, unique email validation, DTOs.
- [ ] **P2-T4** — Seed migration with one Sales Manager and one Product Manager account.
- [ ] **P2-T5** — Frontend: Create `AuthContext` (login, logout, register, JWT persistence + decode). Build Login and Register pages matching the Aurelia aesthetic. Implement `PrivateRoute` with role checking.

---

## Phase 3: Book Catalog & Categories

> Goal: Product managers can manage books/categories. All users can browse, search, sort.

- [ ] **P3-T1** — Create Flyway migration for `categories` (id, name, description, icon_name) and `books` (id, title, author, isbn, edition, description, stock_quantity, price, original_price, return_policy, publisher, page_count, language, publication_year, cover_image_url, cover_color, category_id FK, timestamps, version). Create JPA entities with `@Version` on Book.
- [ ] **P3-T2** — Implement `BookRepository` (search by title/author/description ILIKE, sort by price/popularity, pagination), `BookService` (CRUD, search with filters, out-of-stock handling), and `BookController` (public GET, PRODUCT_MANAGER write endpoints). Implement `CategoryService` and `CategoryController` (CRUD, public reads).
- [ ] **P3-T3** — Seed migration with sample categories (Fiction, Non-Fiction, Sci-Fi & Fantasy, History & Antiquity, Mystery & Crime, Classic Literature) and 15-20 books with cover colors matching the design palette.
- [ ] **P3-T4** — Frontend: Build the book listing page. Recreate the "New & Notable Editions" grid from the reference — book cards with colored covers, spine effect, Phosphor icon, hover lift animation. Add search bar, sort dropdown (price, popularity), and category filter sidebar/nav.
- [ ] **P3-T5** — Frontend: Build the book detail page — hero section with large book cover rendering, title (Playfair serif), author, price, stock status, description, book specs (edition, ISBN, pages, publisher, language), and an "Add to Cart" button (disabled if out of stock).

---

## Phase 4: Shopping Cart & Order Placement

> Goal: Users can manage a cart (guests included), log in, and place orders.

- [ ] **P4-T1** — Frontend: Create `CartContext` (localStorage-backed, add/remove/update/clear/getTotal). Build Cart page — line items with book cover thumbnails, editable quantities, per-item totals, grand total, "Proceed to Checkout" button (redirects to login if unauthenticated).
- [ ] **P4-T2** — Create Flyway migration for `orders` (id, customer_id, total_price, status enum [PROCESSING, IN_TRANSIT, DELIVERED, CANCELLED, REFUND_REQUESTED, REFUNDED], shipping_address, timestamps), `order_items` (id, order_id, book_id, quantity, unit_price, discount_applied), and `credit_cards` (id, customer_id, card_number_encrypted, cardholder_name, expiry_month, expiry_year). Create entities. Implement AES encryption utility for card storage.
- [ ] **P4-T3** — Implement `OrderService.placeOrder()`: validate stock with optimistic locking retry, decrement stock atomically, create order (PROCESSING), save encrypted payment info. Implement `OrderController`: `POST /api/orders`, `GET /api/orders` (customer's own, paginated), `GET /api/orders/{id}`.
- [ ] **P4-T4** — Frontend: Build Checkout page (shipping address form, credit card form, order summary). Build Order History page (list with status badges). Build Order Detail page (items, prices, status, address).

---

## Phase 5: Invoice, Email & PDF

> Goal: On order success, generate a PDF invoice and email it.

- [ ] **P5-T1** — Add OpenPDF dependency. Implement `InvoiceService.generateInvoicePdf(Order)` returning byte array. Invoice: order ID, date, customer info, itemized books (title, author, qty, unit price, discount, subtotal), total.
- [ ] **P5-T2** — Implement `GET /api/orders/{id}/invoice` (owner or SALES_MANAGER, returns PDF). Configure `JavaMailSender` (Mailtrap for dev). Implement `EmailService`. Integrate into order flow: generate + email async (`@Async`).
- [ ] **P5-T3** — Frontend: Order confirmation page after checkout with "Download Invoice" button.

---

## Phase 6: Ratings, Reviews & Wishlist

> Goal: Customers rate/review books, product managers moderate, wishlists work.

- [ ] **P6-T1** — Create Flyway migration for `reviews` (id, book_id, customer_id, rating 1-5, comment, approved default false, created_at; unique on book+customer) and `wishlists` (id, customer_id, book_id, added_at; unique on customer+book). Create entities and repositories.
- [ ] **P6-T2** — Implement `ReviewService` and `ReviewController`: create review (customer, auth required), get approved reviews (public), get pending reviews (PRODUCT_MANAGER), approve/reject. Implement `WishlistService` and `WishlistController`: add, remove, list. Update book queries to include average rating for popularity sorting.
- [ ] **P6-T3** — Frontend: Add star rating display to book cards and detail page. Build review section on detail page (approved reviews list + submit form with star selector and textarea for authenticated users).
- [ ] **P6-T4** — Frontend: Add wishlist heart toggle (Phosphor heart icon) on book cards and detail page. Build Wishlist page. Connect heart icon in header to wishlist page.

---

## Phase 7: Admin Panel — Sales Manager & Product Manager

> Goal: Full admin functionality for both manager roles.

### Product Manager

- [ ] **P7-T1** — Frontend: Build admin layout with sidebar navigation (separate from the storefront layout). Build book management page (CRUD table + add/edit form with all fields including cover color picker). Build category management page.
- [ ] **P7-T2** — Implement `DeliveryService` and `DeliveryController`: `GET /api/admin/deliveries` (delivery ID, customer, book, quantity, total, address, completion status), `PATCH /api/admin/deliveries/{id}/status` (PROCESSING → IN_TRANSIT → DELIVERED). Frontend: Build delivery management page with status update controls.
- [ ] **P7-T3** — Frontend: Build stock management page (book list with inline quantity editing). Build comment moderation page (pending reviews with approve/reject buttons and content preview).

### Sales Manager

- [ ] **P7-T4** — Implement discount logic: `POST /api/admin/discounts` (SALES_MANAGER, takes book IDs + percentage, updates prices, stores original price). Create `notifications` table migration. Implement `NotificationService`: create notifications for wishlist users on discount. Notification endpoints: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`.
- [ ] **P7-T5** — Frontend: Build discount management page (book multi-select, percentage input, apply, show currently discounted books). Add notification bell (Phosphor bell icon) in header with unread badge and dropdown list.
- [ ] **P7-T6** — Implement invoice query: `GET /api/admin/invoices?startDate=...&endDate=...` (SALES_MANAGER). Implement revenue analytics: `GET /api/admin/revenue?startDate=...&endDate=...` (revenue, profit, breakdown).
- [ ] **P7-T7** — Frontend: Build invoice management page (date range picker, invoice table, PDF download per row). Build revenue dashboard (date range picker, chart via Recharts, summary cards for revenue/profit/order count).

---

## Phase 8: Refunds, Cancellations & Polish

> Goal: Complete remaining business logic, harden, and polish.

- [ ] **P8-T1** — Implement order cancellation: `PATCH /api/orders/{id}/cancel` (customer, PROCESSING only, restore stock). Implement refund request: `POST /api/orders/{id}/refund` (customer, within 30 days, DELIVERED only). Refund amount = original purchase price including any discount active at time of purchase.
- [ ] **P8-T2** — Implement refund approval: `PATCH /api/admin/refunds/{orderId}/approve` (SALES_MANAGER, restore stock, set REFUNDED) and `/reject`.
- [ ] **P8-T3** — Frontend: Add "Cancel Order" button on Order Detail (visible when PROCESSING). Add "Request Refund" button (visible when DELIVERED and within 30 days). Build refund management page for SALES_MANAGER (pending requests, approve/reject, order details, refund amount).
- [ ] **P8-T4** — Security hardening: audit all endpoints for role checks, verify encryption, add rate limiting to auth endpoints, review input validation.
- [ ] **P8-T5** — UI polish: consistent loading skeletons, error toasts, empty states ("No books found", "Your cart is empty"), responsive design for mobile/tablet, check all pages against the Aurelia design system.
- [ ] **P8-T6** — End-to-end smoke test: register → browse → search → add to cart → checkout → invoice email → rate book → cancel order → refund flow. Update README with final setup instructions.

---

## Summary

**Total tasks: 44**

| Phase | Tasks | Focus |
|-------|-------|-------|
| P1 | 4 | Scaffolding, design system, layout |
| P2 | 5 | Auth & user management |
| P3 | 5 | Book catalog & categories |
| P4 | 4 | Cart & order placement |
| P5 | 3 | Invoice, PDF, email |
| P6 | 4 | Reviews, ratings, wishlist |
| P7 | 7 | Admin panel (both roles) |
| P8 | 6 | Refunds, polish, hardening |

---

## Requirement Coverage

| Req # | Weight | Covered By |
|-------|--------|------------|
| 3 — stock + delivery status | 10% | P3-T1, P4-T3, P7-T2 |
| 4 — guest cart, login, payment, invoice email | 10% | P4-T1/T4, P2, P5 |
| 5 — comments + ratings + moderation | 10% | P6-T1/T2/T3, P7-T3 |
| 6 — attractive UI | 5% | P1-T4, P8-T5, all frontend tasks |
| 7 — search, sort, out-of-stock | 10% | P3-T2/T4 |
| 8 — admin interface | 10% | P7 |
| 9 — product properties | — | P3-T1 |
| 10 — three roles | — | P2 |
| 11 — sales manager features | 10% | P7-T4/T5/T6/T7 |
| 12 — product manager features | 10% | P7-T1/T2/T3 |
| 13 — customer features | 10% | P3, P4, P6, P8-T1/T3 |
| 14 — credit card | 3% | P4-T2/T4 |
| 15 — refunds within 30 days | 10% | P8-T1/T2/T3 |
| 16 — security | 1% | P2-T2, P4-T2, P8-T4 |
| 17 — concurrency | 1% | P3-T1 (@Version), P4-T3 |
