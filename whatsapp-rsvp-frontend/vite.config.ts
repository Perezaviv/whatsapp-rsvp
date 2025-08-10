
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Keep the frontend running on a consistent port
    proxy: {
      // Proxy API requests to the backend server during development
      // This avoids CORS issues locally.
      '/api': {
        target: 'http://localhost:3000', // Your backend's local address
        changeOrigin: true,
      },
    },
  },
})