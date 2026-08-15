import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // 🌟 THE PWA CONFIGURATION ENGINE MATRIX
    VitePWA({
      registerType: 'autoUpdate', // Automatically activates new service workers on changes
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Northern Market B2B Platform',
        short_name: 'NorthernMarket',
        description: 'Wholesale hardware component and diagnostics spares catalog',
        theme_color: '#2e7d32', // Matches your corporate green palette
        background_color: '#fbfbfb',
        display: 'standalone', // Hides browser address bars when launched from home screen
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Caches your massive charting engine and core assets for instant off-line delivery
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 6000000 // Extended to fully enclose your charts package
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 5000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) {
              return 'vendor-ui-core';
            }
            if (id.includes('plotly') || id.includes('chart')) {
              return 'vendor-charts-engine';
            }
            return 'vendor-dependencies';
          }
        }
      }
    }
  }
});
