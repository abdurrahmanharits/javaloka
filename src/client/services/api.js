const API_PREFIX = '/api';

async function request(path, options = {}) {
    const response = await fetch(`${API_PREFIX}${path}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
        ...options,
    });
    const body = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok || body?.success === false) {
        const error = new Error(body?.message ?? 'Permintaan tidak dapat diproses.');
        error.status = response.status;
        error.errors = body?.errors ?? {};
        throw error;
    }
    return body?.data;
}

export const api = {
    get: (path) => request(path),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
    patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
