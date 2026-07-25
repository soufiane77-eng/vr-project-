import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/zen': {
        target: 'https://opencode.ai/zen',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zen/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  }
});
