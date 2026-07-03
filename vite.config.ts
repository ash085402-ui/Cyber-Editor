import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_BASE || '/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,

  build: {
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('konva')) return 'canvas';
            if (id.includes('zustand')) return 'state';
          }
          return undefined;
        },
      },
    },

    sourcemap: false,
    minify: 'esbuild',
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
  },
});