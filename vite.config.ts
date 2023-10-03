import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        vue(),
        checker({
            typescript: true
        }),
        viteStaticCopy({
            targets: [
                {
                    src: resolve('node_modules/onnxruntime-web/dist/*.wasm'),
                    dest: '.'
                },
                {
                    src: resolve('src/assets/*'),
                    dest: 'assets'
                }
            ]
        })
    ],
    css: {
        postcss: resolve('./postcss.config.js')
    },
    resolve: {
        alias: {
            sam: resolve(__dirname, './src')
        }
    },
    server: {
        port: 8080,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'credentialless'
        }
    }
});
