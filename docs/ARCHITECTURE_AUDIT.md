# Architecture audit — Javaloka Coffee

Audit date: 28 July 2026

## Existing architecture

The repository is a Laravel application using Inertia React and Vite. Laravel owns page routing, authentication, validation, flash messages, server-side authorization, inventory mutations, SQLite access, and production entry points. React is a client-rendered Inertia view layer.

## Frontend inventory

| Area | Legacy source | Notes |
| --- | --- | --- |
| Application bootstrap | `resources/js/app.jsx` | `createInertiaApp`, page resolver, Inertia progress |
| Shared layout | `resources/js/Layouts/SiteLayout.jsx` | Desktop/mobile navigation, language switcher, header/footer, auth buttons |
| Shared card | `resources/js/Components/ProductCard.jsx` | Product status and contact query-string link |
| Language | `resources/js/hooks/useLanguage.js` | Persists `javaloka-lang` in `localStorage` |
| Public pages | `Pages/Welcome.jsx`, `Products/Index.jsx`, `About/Index.jsx`, `Contact/Index.jsx` | Require catalog data only for home/products; contact consumes `?product=` |
| Auth/admin | `Pages/Auth/Login.jsx`, `Pages/Admin/Dashboard.jsx` | Inertia forms/router/shared props need REST/session replacements |
| Styling/assets | `resources/css/app.css`, `public/assets/**` | Must be retained unchanged; several hero images are external Unsplash URLs |

## Laravel routes and behavior

- Public: `/`, `/products`, `/about`, `/contact`; home gets featured products and products gets active products.
- Guest auth: `GET /login`, `POST /login`; only admins can complete login.
- Authenticated: `POST /logout`.
- Admin-only: `/admin`, product create/update/delete, inventory adjustment, and admin account CRUD.
- `HandleInertiaRequests` shares authenticated user, flash messages, validation errors, and the route URL map with every page.

## Data model and business rules

- `users`: name, unique email, bcrypt password, `admin`/`customer` role, verification/timestamps.
- `products`: catalog fields, unique SKU, decimal inventory fields, active/featured flags, JSON tasting notes.
- `stock_movements`: immutable audit records related to products and cascade-deleted with them.
- `InventoryService` has transactional receive, reserve, release, fulfill, and adjust operations. It prevents negative stock/reservations and computes `available_stock` and `inventory_status`.
- Admin rules already prevent self-deletion and deletion of the last admin; product and account payloads are validated server-side.

## Deployment findings and migration constraints

- Current runtime requires PHP/Laravel, Composer, `public/index.php`, Blade, and Laravel Vite; this does not satisfy the single Node Web App target.
- `database/database.sqlite` is the legacy source of truth and must be retained during migration; legacy `$2y$` bcrypt hashes require `$2b$` normalization for Node bcrypt.
- `node_modules` and `vendor` are present locally but must not be deployed/committed as application source.
- No visual baseline can be captured reliably until the legacy Laravel app is configured and running. The migration therefore preserves the original JSX element order, CSS class names, CSS, asset paths, copy, responsive markup, and `javaloka-lang` storage key; visual parity must be independently screenshot-compared after a configured legacy baseline is available.

## Target mapping

Laravel controllers/routes become Express `/api` routes; Inertia shared props become React auth/flash contexts and API services; Eloquent models/migrations become Prisma MySQL models/migration; Laravel sessions become `express-session` backed by MySQL; Express will serve Vite `dist/client` with SPA fallback while leaving `/api` JSON-only.
