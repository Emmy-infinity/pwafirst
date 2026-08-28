import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Northern Market B2B Platform',
        short_name: 'NorthernMarket',
        description: 'Wholesale hardware component and diagnostics spares catalog',
        theme_color: '#2e7d32',
        background_color: '#fbfbfb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        version: '2.0.0',   // 🔥 Force new SW
        icons: [
          { src: 'emmy.jpg', sizes: '192x192', type: 'image/jpg' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 6000000,
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
            }
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 5000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    target: 'es2020'
    // 🔥 No manualChunks – let Vite handle it automatically (no circular deps)
  }
});
