import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/site-pis/', // GitHub Pages subdirectory
  server: {
    port: 3000,
    host: true
  }
})
