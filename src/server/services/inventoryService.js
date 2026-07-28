import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/http.js';

const amount = (value) => Number(Number(value).toFixed(2));
const positive = (value) => { const parsed = amount(value); if (!Number.isFinite(parsed) || parsed <= 0) throw new HttpError(422, 'Quantity must be greater than zero.'); return parsed; };

export function getInventory(product) {
    const stock = amount(product.stock); const reservedStock = amount(product.reservedStock);
    return { stock, reservedStock, availableStock: Math.max(amount(stock - reservedStock), 0) };
}

export function getInventoryStatus(product) {
    const { availableStock } = getInventory(product);
    if (!product.isActive) return 'inactive';
    if (availableStock <= 0) return 'out_of_stock';
    return availableStock <= Number(product.lowStockThreshold) ? 'low_stock' : 'in_stock';
}

export class InventoryService {
    constructor(prisma) { this.prisma = prisma; }

    async receive(productId, quantity, options = {}) { return this.#change(productId, 'stock_in', positive(quantity), (state, q) => ({ stock: state.stock + q, reservedStock: state.reservedStock }), options); }
    async reserve(productId, quantity, options = {}) {
        return this.#change(productId, 'reserved', positive(quantity), (state, q) => {
            if (state.stock - state.reservedStock < q) throw new HttpError(409, 'Available stock is insufficient for this reservation.');
            return { stock: state.stock, reservedStock: state.reservedStock + q };
        }, options);
    }
    async release(productId, quantity, options = {}) {
        return this.#change(productId, 'released', positive(quantity), (state, q) => {
            if (state.reservedStock < q) throw new HttpError(422, 'Reserved stock cannot be released below zero.');
            return { stock: state.stock, reservedStock: state.reservedStock - q };
        }, options);
    }
    async fulfill(productId, quantity, options = {}) {
        return this.#change(productId, 'stock_out', positive(quantity), (state, q) => {
            if (state.stock < q || state.reservedStock < q) throw new HttpError(409, 'Reserved stock is insufficient for fulfillment.');
            return { stock: state.stock - q, reservedStock: state.reservedStock - q };
        }, options);
    }
    async adjustStock(productId, newStock, options = {}) {
        const parsed = amount(newStock);
        if (!Number.isFinite(parsed) || parsed < 0) throw new HttpError(422, 'Stock cannot be negative.');
        return this.#change(productId, 'adjusted', parsed, (state, nextStock) => {
            if (nextStock < state.reservedStock) throw new HttpError(422, 'Physical stock cannot be lower than reserved stock.');
            return { stock: nextStock, reservedStock: state.reservedStock, movementQuantity: Math.abs(nextStock - state.stock), metadata: { direction: nextStock > state.stock ? 'increase' : 'decrease' } };
        }, options, true);
    }

    async #change(productId, type, quantity, transform, options, isAdjustment = false) {
        return this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw(Prisma.sql`SELECT id FROM products WHERE id = ${Number(productId)} FOR UPDATE`);
            const product = await tx.product.findUnique({ where: { id: Number(productId) } });
            if (!product) throw new HttpError(404, 'Product not found.');
            const before = getInventory(product); const next = transform(before, quantity);
            const stock = amount(next.stock); const reservedStock = amount(next.reservedStock);
            if (stock < 0 || reservedStock < 0 || reservedStock > stock) throw new HttpError(422, 'Invalid inventory state.');
            if (isAdjustment && stock === before.stock) return product;
            const updated = await tx.product.update({ where: { id: product.id }, data: { stock, reservedStock } });
            await tx.stockMovement.create({ data: {
                productId: product.id, type, quantity: amount(next.movementQuantity ?? quantity), stockBefore: before.stock, stockAfter: stock,
                reservedBefore: before.reservedStock, reservedAfter: reservedStock, note: options.note ?? null,
                reference: options.reference ?? null, metadata: next.metadata ?? options.metadata ?? undefined,
            } });
            return updated;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }
}
