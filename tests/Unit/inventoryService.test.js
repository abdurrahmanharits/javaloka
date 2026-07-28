import { describe, expect, it } from 'vitest';
import { getInventory, getInventoryStatus, InventoryService } from '../../src/server/services/inventoryService.js';

function memoryPrisma(product) {
    const movements = [];
    const tx = {
        $queryRaw: async () => [],
        product: {
            findUnique: async () => product,
            update: async ({ data }) => Object.assign(product, data),
        },
        stockMovement: { create: async ({ data }) => { movements.push(data); return data; } },
    };
    return { movements, $transaction: async (callback) => callback(tx) };
}

describe('inventory calculations', () => {
    it('computes available stock and statuses', () => {
        expect(getInventory({ stock: 5, reservedStock: 1 })).toMatchObject({ availableStock: 4 });
        expect(getInventoryStatus({ stock: 5, reservedStock: 5, lowStockThreshold: 1, isActive: true })).toBe('out_of_stock');
        expect(getInventoryStatus({ stock: 5, reservedStock: 4, lowStockThreshold: 1, isActive: true })).toBe('low_stock');
        expect(getInventoryStatus({ stock: 5, reservedStock: 0, lowStockThreshold: 1, isActive: false })).toBe('inactive');
    });

    it('receives, reserves, releases, fulfills, and adjusts atomically', async () => {
        const product = { id: 1, stock: 5, reservedStock: 0, lowStockThreshold: 1, isActive: true };
        const prisma = memoryPrisma(product); const service = new InventoryService(prisma);
        await service.receive(1, 2); expect(product.stock).toBe(7);
        await service.reserve(1, 3); expect(product.reservedStock).toBe(3);
        await service.release(1, 1); expect(product.reservedStock).toBe(2);
        await service.fulfill(1, 2); expect(product).toMatchObject({ stock: 5, reservedStock: 0 });
        await service.adjustStock(1, 4); expect(product.stock).toBe(4);
        expect(prisma.movements).toHaveLength(5);
    });

    it('rejects negative stock and reservations exceeding stock', async () => {
        const product = { id: 1, stock: 1, reservedStock: 0, lowStockThreshold: 1, isActive: true };
        const service = new InventoryService(memoryPrisma(product));
        await expect(service.reserve(1, 2)).rejects.toMatchObject({ status: 409 });
        await expect(service.adjustStock(1, -1)).rejects.toMatchObject({ status: 422 });
    });
});
