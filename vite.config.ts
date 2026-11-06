import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // GitHub Pages alt dizini: GH_PAGES_BASE=/onkodoz-primer-v2/ npm run build
    base: process.env.GH_PAGES_BASE || '/',
    plugins: [react(), tailwindcss()],
    // onnxruntime-web'i açılışta önceden paketle: ilk ziyarette "new deps → full reload"
    // olup E2E testinin ortasında oyun durumunu sıfırlamasın (regresyon testinde yakalandı).
    optimizeDeps: { include: ['onnxruntime-web'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : { ignored: ['**/cypress/**', '**/docs/**', '**/data/**', '**/model/**', '**/tests/**', '**/*.md'] },
    },
  };
});
