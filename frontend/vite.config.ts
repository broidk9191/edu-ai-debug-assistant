import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3001,
      // Only use proxy in development when VITE_API_URL is not set
      proxy: !env.VITE_API_URL ? {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      } : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
