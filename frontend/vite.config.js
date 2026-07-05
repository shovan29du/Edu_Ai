import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Global Education Platform',
        short_name: 'Edu_Ai',
        start_url: '/',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: '#2563eb',
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Cache syllabus data so a grade already viewed once stays
            // readable offline; refresh from the network when available.
            urlPattern: /\/api\/grade\/\d+$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'syllabus-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /\/api\/(safe-music|safe-channels|profiles)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-data-cache' },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.BACKEND_URL || 'http://localhost:8000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          'react-player': ['react-player'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
});
