import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression(), // Compresión gzip/brotli para archivos estáticos
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'I GT de Ceuta - Warhammer 40.000',
        short_name: 'GT Ceuta',
        description: 'Gran Torneo oficial de Warhammer 40.000 en Ceuta',
        theme_color: '#b91c1c',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      },
    }),
  ],
  build: {
    outDir: 'dist',
    reportCompressedSize: true,
    // Importante: deshabilitar incrustación para PDFs y otros documentos
    assetsInlineLimit: 0,
    rollupOptions: {
      // Configuración para mejorar el manejo de archivos estáticos
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Asegura que la carpeta public se maneje correctamente
  publicDir: 'public',
  // Server options para desarrollo local
  server: {
    port: 3000,
    strictPort: true,
  }
});
