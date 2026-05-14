import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: { port: 4174 },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  resolve: {
    alias: {
      '@kattour/compiler': resolve(__dirname, '../../packages/compiler/src/index.ts')
    }
  }
});
