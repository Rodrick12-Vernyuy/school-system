import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-server proxy so the frontend can call relative /api/v1/... paths and
// Vite forwards them to the API Gateway - avoids CORS friction during local
// development (in Docker, nginx serves the built frontend and the gateway
// is reached via its published port instead, see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: process.env.VITE_GATEWAY_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
