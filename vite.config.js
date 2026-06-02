import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      // Prompt the user before reloading so we can show a "new version" toast
      // instead of silently refreshing mid-interaction.
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'Projekt28',
        short_name: 'Projekt28',
        description: 'Korona Gór Polski – peaks, tracks and POIs',
        theme_color: '#2d6a4f',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the built app shell (JS/CSS/HTML) so the UI boots offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // SPA fallback: serve index.html for navigations while offline.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // OpenStreetMap base tiles – cache tiles already viewed.
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // GPX track files – cache each track once visited so it loads offline.
            urlPattern: /\/assets\/.*\.gpx$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gpx-tracks',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase REST/storage GETs – serve cached data offline, refresh online.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-data',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Enable the service worker during `vite dev` for testing.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
