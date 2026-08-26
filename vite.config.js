import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // API proxy target for development (only used in dev mode)
  const apiProxyTarget = env.VITE_API_TARGET || 'http://localhost:8081'

  return {
    plugins: [
      react(),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Build configuration for production
    build: {
      sourcemap: mode === 'production' ? false : true,
    },
    // Ensure environment variables are properly loaded
    envPrefix: 'VITE_',
  }
})
