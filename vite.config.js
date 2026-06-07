import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
