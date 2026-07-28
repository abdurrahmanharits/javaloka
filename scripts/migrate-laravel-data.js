import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { prisma } from '../src/server/config/prisma.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'database', 'database.sqlite');
if (!fs.existsSync(source)) throw new Error(`Legacy SQLite database not found: ${source}`);
const backup = `${source}.backup-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}`;
fs.copyFileSync(source, backup);
console.log(`Backup created: ${backup}`);
const SQL = await initSqlJs(); const db = new SQL.Database(fs.readFileSync(source));
const tableExists = (name) => db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='" + name.replaceAll("'", "''") + "'").length > 0;
const rows = (table) => tableExists(table) ? db.exec(`SELECT * FROM ${table}`)[0]?.values.map((values) => Object.fromEntries(db.exec(`SELECT * FROM ${table}`)[0].columns.map((column, index) => [column, values[index]]))) ?? [] : [];
const decimal = (value) => Number(value ?? 0); const normaliseHash = (hash) => typeof hash === 'string' && hash.startsWith('$2y$') ? `$2b$${hash.slice(4)}` : hash;
let userCount = 0; let productCount = 0; let movementCount = 0;
try {
    for (const user of rows('users')) { await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name, password: normaliseHash(user.password), role: user.role === 'admin' ? 'admin' : 'customer' }, create: { id: user.id, name: user.name, email: user.email, password: normaliseHash(user.password), role: user.role === 'admin' ? 'admin' : 'customer', emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : null } }); userCount++; }
    for (const product of rows('products')) { await prisma.product.upsert({ where: { sku: product.sku || `PRD-${String(product.id).padStart(4, '0')}` }, update: {}, create: { id: product.id, name: product.name, sku: product.sku || `PRD-${String(product.id).padStart(4, '0')}`, origin: product.origin, roastLevel: product.roast_level, descriptionId: product.description_id, descriptionEn: product.description_en, price: decimal(product.price), weight: product.weight, tastingNotes: JSON.parse(product.tasting_notes || '[]'), imagePath: product.image_path, type: product.type || 'single-origin', stock: decimal(product.stock), reservedStock: decimal(product.reserved_stock), lowStockThreshold: decimal(product.low_stock_threshold ?? 5), isActive: Boolean(product.is_active ?? 1), isFeatured: Boolean(product.is_featured ?? 0) } }); productCount++; }
    for (const movement of rows('stock_movements')) { await prisma.stockMovement.upsert({ where: { id: movement.id }, update: {}, create: { id: movement.id, productId: movement.product_id, type: movement.type, quantity: decimal(movement.quantity), stockBefore: decimal(movement.stock_before), stockAfter: decimal(movement.stock_after), reservedBefore: decimal(movement.reserved_before), reservedAfter: decimal(movement.reserved_after), reference: movement.reference, note: movement.note, metadata: movement.metadata ? JSON.parse(movement.metadata) : undefined } }); movementCount++; }
    console.log(`Migrated ${userCount} users, ${productCount} products, ${movementCount} stock movements.`);
} finally { db.close(); await prisma.$disconnect(); }
