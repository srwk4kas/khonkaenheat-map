import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'ระบบติดตามสภาพแวดล้อม จังหวัดขอนแก่น',
        short_name: 'KK Map',
        description: 'ติดตามสภาพอากาศ ฝุ่น PM2.5 และแผนที่ความร้อน อำเภอเมืองขอนแก่น แบบ Real-time',
        lang: 'th',
        theme_color: '#0f172a',
        background_color: '#f8faff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Open-Meteo weather API — NetworkFirst (fresh data preferred)
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 8,
            },
          },
          // Map tiles — CacheFirst (tiles rarely change)
          {
            urlPattern: /^https:\/\/server\.arcgisonline\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'esri-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/tiles\.maps\.eox\.at\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sentinel-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Nominatim geocoding — NetworkFirst with short cache
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nominatim',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  server: {
    proxy: {
      '/tmd-api': {
        target: 'http://www.aws-observation.tmd.go.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmd-api/, ''),
      },
      '/tmd-weather': {
        target: 'https://data.tmd.go.th',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.path = '/api/Weather3Hours/v2/?uid=api&ukey=api12345';
          });
        },
      },
    },
  },
})
