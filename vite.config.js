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
        screenshots: [ /* add your screenshots here */ ],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
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
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor-ui-core';
            if (id.includes('plotly') || id.includes('chart')) return 'vendor-charts-engine';
            if (id.includes('react')) return 'vendor-react-core';
            return 'vendor-dependencies';
          }
        }
      }
    }
  }
});
