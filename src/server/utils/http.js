export function success(res, data = {}, message = 'OK', status = 200) {
    return res.status(status).json({ success: true, message, data });
}

export class HttpError extends Error {
    constructor(status, message, errors) { super(message); this.status = status; this.errors = errors; }
}

export function serialize(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object' && typeof value.toNumber === 'function') return value.toNumber();
    if (Array.isArray(value)) return value.map(serialize);
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
    return value;
}
