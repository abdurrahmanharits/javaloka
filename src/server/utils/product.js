import { serialize } from './http.js';

export function inventoryStatus(product) {
    const stock = Number(product.stock);
    const reserved = Number(product.reservedStock ?? product.reserved_stock ?? 0);
    const available = Math.max(Number((stock - reserved).toFixed(2)), 0);
    if (!(product.isActive ?? product.is_active)) return { available_stock: available, inventory_status: 'inactive' };
    if (available <= 0) return { available_stock: available, inventory_status: 'out_of_stock' };
    if (available <= Number(product.lowStockThreshold ?? product.low_stock_threshold)) return { available_stock: available, inventory_status: 'low_stock' };
    return { available_stock: available, inventory_status: 'in_stock' };
}

export function serializeProduct(product) {
    const row = serialize(product);
    return { ...row, roast_level: row.roastLevel, description_id: row.descriptionId, description_en: row.descriptionEn,
        tasting_notes: row.tastingNotes, image_path: row.imagePath, reserved_stock: row.reservedStock,
        low_stock_threshold: row.lowStockThreshold, is_active: row.isActive, is_featured: row.isFeatured, ...inventoryStatus(product) };
}
