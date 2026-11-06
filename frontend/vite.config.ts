import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Em desenvolvimento, /api vai para o backend local
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})