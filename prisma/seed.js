import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const admin = { name: process.env.ADMIN_NAME ?? 'Javaloka Admin', email: process.env.ADMIN_EMAIL ?? 'admin@javaloka.test', password: process.env.ADMIN_PASSWORD ?? 'password123' };
const products = [
    { name: 'Gayo Natural', sku: 'JVL-GAYO-200', origin: 'Aceh Gayo', roastLevel: 'medium', descriptionId: 'Kopi natural process dari Dataran Tinggi Gayo dengan karakter buah tropis.', descriptionEn: 'Natural process coffee from the Gayo Highlands with tropical fruit character.', price: 85000, weight: '200g', tastingNotes: ['Strawberry', 'Dark Chocolate', 'Wine-like'], type: 'single-origin', stock: 4.8, lowStockThreshold: 1.2, isActive: true, isFeatured: true },
    { name: 'Flores Bajawa', sku: 'JVL-FLORES-200', origin: 'Flores, NTT', roastLevel: 'light', descriptionId: 'Arabika washed dengan profil cerah dan sweetness gula aren.', descriptionEn: 'Washed Arabica with bright profile and brown sugar sweetness.', price: 80000, weight: '200g', tastingNotes: ['Citrus', 'Brown Sugar', 'Cedar'], type: 'single-origin', stock: 2.4, lowStockThreshold: 1, isActive: true, isFeatured: true },
];
try {
    await prisma.user.upsert({ where: { email: admin.email }, update: { name: admin.name, role: 'admin' }, create: { name: admin.name, email: admin.email, password: await bcrypt.hash(admin.password, 12), role: 'admin' } });
    for (const product of products) await prisma.product.upsert({ where: { sku: product.sku }, update: product, create: product });
    console.log(`Seeded admin ${admin.email} and ${products.length} products.`);
} finally { await prisma.$disconnect(); }
