import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { createHtmlPlugin } from 'vite-plugin-html';
import tailwindConfig from './tailwind.config.mjs';
import CONFIG from './config';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig({

  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(), ViteImageOptimizer(), compression(),
    createHtmlPlugin({
      inject: {
        data: {
          title: CONFIG.appName,
          metaTitle: CONFIG.metaTags.title,
          metaDescription: CONFIG.metaTags.description,
          metaImageURL: CONFIG.metaTags.imageURL,
        },
      },
    }),
    ...(CONFIG.enablePWA
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.png'],
            manifest: {
              name: CONFIG.appName,
              short_name: CONFIG.appName,
              description: CONFIG.metaTags.description,
              theme_color: CONFIG.theme.accentColor,
              icons: [
                {
                  src: 'icon.png',
                  sizes: '64x64 32x32 24x24 16x16 192x192 512x512',
                  type: 'image/png',
                },
              ],
            },
          }),
        ]
      : []),
  ],
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer],
    },
  },
  define: {
    CONFIG: CONFIG,
  },
});
