import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/site-pis/' : '/', // GitHub Pages subdirectory only for production
  server: {
    port: 3000,
    host: true
  },
  // Fix for Windows OneDrive permission issues
  cacheDir: './.vite-cache'
}))
