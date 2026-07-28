import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(32),
    APP_URL: z.string().url().optional(),
    ADMIN_NAME: z.string().min(1).default('Javaloka Admin'),
    ADMIN_EMAIL: z.string().email().default('admin@javaloka.test'),
    ADMIN_PASSWORD: z.string().min(8).default('password123'),
});

export const env = schema.parse(process.env);
