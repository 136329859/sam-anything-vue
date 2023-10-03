import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [vue()],
    css: {
        postcss: './postcss.config.js'
    },
    resolve: {
        alias: {
            sam: resolve(__dirname, './src')
        }
    }
});
