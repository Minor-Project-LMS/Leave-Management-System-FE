import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to 'CWD' to load env files from the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  // API proxy target for development (only used in dev mode)
  const apiProxyTarget = env.VITE_API_TARGET || 'http://localhost:8081'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          // Only proxy in development
          configure: (proxy, options) => {
            if (mode === 'development') {
              proxy.on('error', (err, req, res) => {
                console.log('proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Sending request to the target:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('Received response from the target:', proxyRes.statusCode, req.url);
              });
            }
          },
        },
      },
    },
    // Build configuration for production
    build: {
      // Generate source maps for production debugging
      sourcemap: mode === 'production' ? false : true,
    },
    // Define global constants
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
    // For Vercel deployment, ensure environment variables are properly loaded
    envPrefix: 'VITE_',
  }
})
