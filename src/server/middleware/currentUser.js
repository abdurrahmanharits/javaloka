import { prisma } from '../config/prisma.js';

export async function attachCurrentUser(req, _res, next) {
    try {
        if (req.session.userId) req.user = await prisma.user.findUnique({ where: { id: req.session.userId } });
        next();
    } catch (error) { next(error); }
}
