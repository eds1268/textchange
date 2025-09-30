import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드 FastAPI가 8000이면 프록시로 /api만 넘김
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})