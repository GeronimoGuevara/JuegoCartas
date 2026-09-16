import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Config base: registra el Service Worker y el manifest para que la PWA
// sea instalable en iOS/Android y funcione 100% offline tras la primera carga.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: el SW se actualiza solo en background, sin pedirle nada al usuario
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Noche de Juego — Cartas, Retos y Preguntas',
        short_name: 'NocheDeJuego',
        description: 'Juego de cartas party game, offline-first, para jugar en grupo o en pareja.',
        theme_color: '#0f0a1f',
        background_color: '#0f0a1f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea todo el build para que la app abra sin red después de la primera visita
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        // Permite probar el comportamiento offline corriendo `npm run dev`
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
