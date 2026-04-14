import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration for Blockchain Escrow Frontend
 * This configuration sets up the development and production build for the React application
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
