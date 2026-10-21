import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const dnirucToken = (
    env.VITE_DNIRUC_API_TOKEN ||
    env.DNIRUC_API_TOKEN ||
    process.env.VITE_DNIRUC_API_TOKEN ||
    process.env.DNIRUC_API_TOKEN ||
    ''
  ).trim();

  return {
    define: {
      'import.meta.env.VITE_DNIRUC_API_TOKEN': JSON.stringify(dnirucToken),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'logo-agroimportadora.png', 'logo-agroimportadora-dark.png'],
        manifest: {
          id: '/',
          name: 'Agroimportadora Perú E.I.R.L. - Sistema de Gestión',
          short_name: 'Agroimportadora',
          description: 'Sistema integral de inventarios, ventas, compras y producción de mezclas',
          lang: 'es-PE',
          theme_color: '#059669',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${env.API_PORT || process.env.API_PORT || 3001}`,
          changeOrigin: false
        }
      }
    },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
          }
        }
      }
    }
  }
};
});
