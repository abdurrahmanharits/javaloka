import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'; // <-- 1. Tambahkan import React Vite

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
        react(), // <-- 2. Aktifkan plugin React di sini
    ],
    server: {
        host: '127.0.0.1', // <-- 3. Ini solusi untuk menghilangkan error [::1]
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});