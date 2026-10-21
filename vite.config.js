import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@janaseva/ui': path.resolve(__dirname, './src/components/ui')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 3000,
    open: true
  }
});
