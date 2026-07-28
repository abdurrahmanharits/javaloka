import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import helmet from 'helmet';
import { env } from './config/env.js';
import { attachCurrentUser } from './middleware/currentUser.js';
import { api } from './routes/api.js';
import { HttpError } from './utils/http.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const clientDir = path.join(root, 'dist/client');
const MySQLStore = MySQLStoreFactory(session);
const databaseUrl = new URL(env.DATABASE_URL);
const sessionDatabase = { host: databaseUrl.hostname, port: Number(databaseUrl.port || 3306), user: decodeURIComponent(databaseUrl.username), password: decodeURIComponent(databaseUrl.password), database: databaseUrl.pathname.slice(1) };

export function createApp() {
    const app = express();
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use(helmet({ contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false, crossOriginEmbedderPolicy: false }));
    app.use(compression());
    app.use(express.json({ limit: '100kb' }));
    app.use(express.urlencoded({ extended: false, limit: '100kb' }));
    app.use(session({
        name: 'javaloka.sid', secret: env.SESSION_SECRET, resave: false, saveUninitialized: false,
        store: new MySQLStore({ createDatabaseTable: true, schema: { tableName: 'sessions', columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' } }, clearExpired: true, checkExpirationInterval: 900000 }, sessionDatabase),
        cookie: { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
    }));
    app.use(attachCurrentUser);
    app.use('/api', api);
    app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API endpoint not found.')));
    app.use(express.static(clientDir, { index: false, maxAge: env.NODE_ENV === 'production' ? '1y' : 0 }));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(clientDir, 'index.html')));
    app.use((error, _req, res, _next) => {
        const status = error instanceof HttpError ? error.status : 500;
        if (status >= 500) console.error('Unhandled application error', error);
        res.status(status).json({ success: false, message: status === 500 && env.NODE_ENV === 'production' ? 'Internal server error.' : error.message || 'Internal server error.', ...(error.errors ? { errors: error.errors } : {}) });
    });
    return app;
}
