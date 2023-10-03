import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { config } from 'dotenv';
import parseEnv from 'dotenv-parse-variables';

import type { ParsedVariables } from 'dotenv-parse-variables';

function readEnv(envFilePath: string): ParsedVariables {
    return parseEnv(config({ path: envFilePath }).parsed ?? {});
}

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
    },
    define: {
        'Bun.env': readEnv(resolve(__dirname, `.env.${Bun.env.NODE_ENV}`))
    }
});
