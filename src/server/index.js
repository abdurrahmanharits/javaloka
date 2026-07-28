import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const server = createApp().listen(env.PORT, '0.0.0.0', () => console.log(`Javaloka listening on 0.0.0.0:${env.PORT}`));
async function shutdown(signal) { console.log(`${signal} received; shutting down.`); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); }
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
