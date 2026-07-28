import { z } from 'zod';

const boolean = z.union([z.boolean(), z.literal('true').transform(() => true), z.literal('false').transform(() => false)]);
const number = z.coerce.number().finite().min(0);

export const productSchema = z.object({
    name: z.string().trim().min(1).max(255), sku: z.string().trim().min(1).max(255), origin: z.string().trim().min(1).max(255),
    roast_level: z.enum(['light', 'medium', 'dark']), type: z.enum(['single-origin', 'blend']), price: number,
    weight: z.string().trim().min(1).max(50), description_id: z.string().trim().min(1), description_en: z.string().trim().min(1),
    tasting_notes: z.string().max(2000).optional().default(''), image_path: z.string().trim().max(2048).optional().default(''),
    stock: number, low_stock_threshold: number, is_active: boolean, is_featured: boolean,
});
export const inventorySchema = z.object({ stock: number, low_stock_threshold: number, is_active: boolean, note: z.string().trim().max(255).optional() });
const accountFields = { name: z.string().trim().min(1).max(255), email: z.string().trim().email().max(255) };
export const accountCreateSchema = z.object({ ...accountFields, password: z.string().min(8), password_confirmation: z.string() }).refine((value) => value.password === value.password_confirmation, { path: ['password_confirmation'], message: 'Password confirmation does not match.' });
export const accountUpdateSchema = z.object({ ...accountFields, password: z.string().max(255).optional().or(z.literal('')), password_confirmation: z.string().optional().or(z.literal('')) }).refine((value) => !value.password || value.password === value.password_confirmation, { path: ['password_confirmation'], message: 'Password confirmation does not match.' });
export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1), remember: z.boolean().optional() });
