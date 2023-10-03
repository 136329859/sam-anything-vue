declare module 'bun' {
    interface Env {
        NODE_ENV: string;
        ORT_WASM: string;
        ORT_WASM_SIMD: string;
        ORT_WASM_THREADED: string;
        ORT_WASM_SIMD_THREADED: string;
    }
}
