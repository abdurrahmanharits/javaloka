# Deploy Javaloka Coffee to Hostinger Node.js Web Apps

## 1. Create the database and environment

Create a MySQL database and user in hPanel, grant that user all privileges for the database, then set these Web App environment variables (do not commit them):

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME"
SESSION_SECRET="a-random-secret-of-at-least-32-characters"
APP_URL="https://your-domain.example"
ADMIN_NAME="Javaloka Admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="use-a-strong-initial-password"
```

If credentials contain reserved URL characters, URL-encode them in `DATABASE_URL`.

## 2. Build, migrate, seed, start

Set the Hostinger build command to `npm ci && npm run build`, run migration once with `npm run prisma:migrate`, and start with `npm start`. Run `npm run seed` only for a new database. The server listens on `process.env.PORT` and Hostinger's reverse proxy supplies HTTPS, so `trust proxy` and production secure cookies are already configured.

After deploying, open `https://your-domain.example/api/health`; it must return JSON with `success: true`.

## 3. Migrate the legacy SQLite data

Before running migration, keep `database/database.sqlite` in the release package. Execute `npm run migrate:legacy`; it first creates a timestamped copy beside the SQLite database, then upserts users, products, and movements into MySQL. It never runs at server startup. Laravel `$2y$` bcrypt hashes are normalized to `$2b$` without changing the remaining hash data, which is compatible with Node bcrypt.

## Troubleshooting and rollback

- **Cookie/login does not persist:** confirm `NODE_ENV=production`, HTTPS is active, the app is served through the configured domain, and `SESSION_SECRET` is unchanged between deploys.
- **Blank page:** check Hostinger logs for the Node process, run `npm run build`, and make sure `dist/client/index.html` exists.
- **404 on refresh:** the app must start with `npm start`; Express, not Vite preview/static hosting, supplies the SPA fallback.
- **Logs:** use Web Apps → application → Logs in hPanel. Do not log cookies or credentials.
- **Domain change:** update `APP_URL`, redeploy, and clear the old site cookie in the browser.
- **Rollback:** redeploy the previous Node release and leave MySQL intact. Take a MySQL backup before applying schema migrations; Prisma migrations are forward-only in normal production use.
