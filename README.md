# Javaloka Coffee

Single-domain Node.js application: React + Vite frontend, Express API, Prisma/MySQL, and server-side MySQL sessions. See [the Hostinger deployment guide](DEPLOY_HOSTINGER_NODE.md) and [the migration audit](docs/ARCHITECTURE_AUDIT.md).

```bash
npm ci
cp .env.example .env
npm run prisma:migrate
npm run seed
npm run build
npm start
```

For a one-time legacy SQLite import, run `npm run migrate:legacy` after setting a MySQL `DATABASE_URL`.
