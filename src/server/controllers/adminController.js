import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { InventoryService } from '../services/inventoryService.js';
import { HttpError, serialize, success } from '../utils/http.js';
import { serializeProduct } from '../utils/product.js';

const notes = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
const inventory = new InventoryService(prisma);
const productPayload = (body) => ({ name: body.name, sku: body.sku, origin: body.origin, roastLevel: body.roast_level, type: body.type, price: body.price, weight: body.weight, descriptionId: body.description_id, descriptionEn: body.description_en, tastingNotes: notes(body.tasting_notes), imagePath: body.image_path || null, lowStockThreshold: body.low_stock_threshold, isActive: body.is_active, isFeatured: body.is_featured });
const adminUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.createdAt });

function prismaError(error) {
    if (error.code === 'P2002') return new HttpError(409, 'Data unik sudah digunakan.', { sku: ['SKU atau email sudah digunakan.'] });
    return error;
}

export async function dashboard(_req, res) {
    const [products, users, recentMovements] = await Promise.all([
        prisma.product.findMany({ orderBy: { createdAt: 'desc' } }), prisma.user.findMany({ where: { role: 'admin' }, orderBy: { createdAt: 'desc' } }),
        prisma.stockMovement.findMany({ include: { product: { select: { id: true, name: true, sku: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    const rows = products.map(serializeProduct); const active = rows.filter((product) => product.is_active);
    success(res, { products: rows, users: users.map(adminUser), recentMovements: serialize(recentMovements).map((row) => ({ ...row, product_id: row.productId, stock_before: row.stockBefore, stock_after: row.stockAfter, reserved_before: row.reservedBefore, reserved_after: row.reservedAfter })), stats: {
        total_products: rows.length, active_products: active.length, low_stock_products: active.filter((p) => p.inventory_status === 'low_stock').length, out_of_stock_products: active.filter((p) => p.inventory_status === 'out_of_stock').length,
        featured_products: rows.filter((p) => p.is_featured).length, total_units: rows.reduce((sum, p) => sum + p.stock, 0), reserved_units: rows.reduce((sum, p) => sum + p.reserved_stock, 0), total_accounts: users.length,
    } });
}

export async function createProduct(req, res, next) {
    try {
        const product = await prisma.$transaction(async (tx) => tx.product.create({ data: { ...productPayload(req.body), stock: 0, reservedStock: 0 } }));
        if (req.body.stock > 0) await inventory.receive(product.id, req.body.stock, { note: 'Initial stock from product creation', reference: 'admin-create-product' });
        success(res, { product: serializeProduct(await prisma.product.findUnique({ where: { id: product.id } })) }, 'Produk baru berhasil ditambahkan.', 201);
    } catch (error) { next(prismaError(error)); }
}
export async function updateProduct(req, res, next) {
    try { const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data: productPayload(req.body) }); success(res, { product: serializeProduct(product) }, 'Produk berhasil diperbarui.'); }
    catch (error) { next(error.code === 'P2025' ? new HttpError(404, 'Product not found.') : prismaError(error)); }
}
export async function deleteProduct(req, res, next) {
    try { await prisma.product.delete({ where: { id: Number(req.params.id) } }); success(res, {}, 'Produk berhasil dihapus.'); }
    catch (error) { next(error.code === 'P2025' ? new HttpError(404, 'Product not found.') : error); }
}
export async function updateInventory(req, res, next) {
    try {
        const product = await inventory.adjustStock(Number(req.params.id), req.body.stock, { note: req.body.note || 'Manual inventory adjustment', reference: 'admin-adjustment' });
        const updated = await prisma.product.update({ where: { id: product.id }, data: { lowStockThreshold: req.body.low_stock_threshold, isActive: req.body.is_active } });
        success(res, { product: serializeProduct(updated) }, 'Inventaris produk berhasil diperbarui.');
    } catch (error) { next(error); }
}
export async function createAccount(req, res, next) {
    try { const user = await prisma.user.create({ data: { name: req.body.name, email: req.body.email, password: await bcrypt.hash(req.body.password, 12), role: 'admin' } }); success(res, { user: adminUser(user) }, 'Akun admin baru berhasil ditambahkan.', 201); }
    catch (error) { next(prismaError(error)); }
}
export async function updateAccount(req, res, next) {
    try { const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { name: req.body.name, email: req.body.email, ...(req.body.password ? { password: await bcrypt.hash(req.body.password, 12) } : {}) } }); success(res, { user: adminUser(user) }, 'Data akun admin berhasil diperbarui.'); }
    catch (error) { next(error.code === 'P2025' ? new HttpError(404, 'User not found.') : prismaError(error)); }
}
export async function deleteAccount(req, res, next) {
    try {
        const id = Number(req.params.id); if (id === req.user.id) throw new HttpError(409, 'Akun admin yang sedang dipakai tidak bisa dihapus.');
        const [user, count] = await Promise.all([prisma.user.findUnique({ where: { id } }), prisma.user.count({ where: { role: 'admin' } })]);
        if (!user || user.role !== 'admin') throw new HttpError(404, 'Admin not found.'); if (count <= 1) throw new HttpError(409, 'Minimal harus ada satu akun admin aktif.');
        await prisma.user.delete({ where: { id } }); success(res, {}, 'Akun berhasil dihapus.');
    } catch (error) { next(error); }
}
