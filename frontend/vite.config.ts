import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API_TARGET is a Node env var used by the Vite dev proxy (not exposed to browser).
// Standalone dev: defaults to http://localhost:8000
// Docker compose dev: set API_TARGET=http://backend:8000 in docker-compose environment
const apiTarget = process.env.API_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
