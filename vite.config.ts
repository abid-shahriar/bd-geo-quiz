import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(__dirname, 'src')
    }
  },
  plugins: [tailwindcss(), tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()]
});
