import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/genre-migrations/',
  plugins: [react(),
  tailwindcss()
  ],
  server: {
    proxy: {
      '/api/openlibrary': {
        target: 'https://openlibrary.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openlibrary/, ''),
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tsne-worker': ['./src/workers/tsneWorker.js']
        }
      }
    },
    worker: {
      format: 'es'
    }
  }
})
