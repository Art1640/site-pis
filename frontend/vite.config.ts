import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Dynamic base path detection
  const getBasePath = () => {
    // For development, always use root
    if (command === 'serve') return '/'

    // For production, default to root (custom domains like moulah-pi.fr)
    // Set VITE_BASE_PATH environment variable for custom deployments
    const customBase = process.env.VITE_BASE_PATH
    if (customBase !== undefined) return customBase

    // Only use GitHub Pages subdirectory if explicitly requested
    const isGitHubPages = process.env.VITE_GITHUB_PAGES === 'true'

    return isGitHubPages ? '/site-pis/' : '/'
  }

  return {
    plugins: [react()],
    base: getBasePath(),
    server: {
      port: 3000,
      host: true
    },
    // Fix for Windows OneDrive permission issues
    cacheDir: './.vite-cache'
  }
})
