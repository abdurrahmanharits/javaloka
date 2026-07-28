import { prisma } from '../config/prisma.js';
import { success } from '../utils/http.js';
import { serializeProduct } from '../utils/product.js';

export async function listProducts(_req, res) {
    const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    success(res, { products: products.map(serializeProduct) });
}
export async function featuredProducts(_req, res) {
    const products = await prisma.product.findMany({ where: { isActive: true, isFeatured: true }, orderBy: { createdAt: 'desc' } });
    success(res, { products: products.map(serializeProduct) });
}
