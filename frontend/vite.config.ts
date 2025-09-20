import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import os from 'os'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  // Fix for Windows OneDrive permission issues
  cacheDir: path.join(os.tmpdir(), 'vite-cache'),
  optimizeDeps: {
    force: true
  }
})
