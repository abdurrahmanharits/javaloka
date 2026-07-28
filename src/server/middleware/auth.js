import { HttpError } from '../utils/http.js';

export function requireAuth(req, _res, next) {
    if (!req.session.userId) return next(new HttpError(401, 'Authentication required.'));
    next();
}

export function requireAdmin(req, _res, next) {
    if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required.'));
    next();
}
