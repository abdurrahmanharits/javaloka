import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { HttpError, success, serialize } from '../utils/http.js';

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export async function login(req, res) {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    const valid = user && await bcrypt.compare(req.body.password, user.password);
    if (!valid || user.role !== 'admin') throw new HttpError(401, 'Email atau password tidak cocok.', { email: ['Email atau password tidak cocok.'] });
    await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
    req.session.userId = user.id;
    if (req.body.remember) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    success(res, { user: publicUser(user) }, 'Login berhasil.');
}

export function me(req, res) {
    if (!req.user) throw new HttpError(401, 'Authentication required.');
    success(res, { user: serialize(publicUser(req.user)) });
}

export async function logout(req, res) {
    await new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));
    res.clearCookie('javaloka.sid'); success(res, {}, 'Kamu sudah logout.');
}
