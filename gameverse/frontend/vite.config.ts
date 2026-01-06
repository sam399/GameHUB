import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable to determine backend target
// Set VITE_USE_NETLIFY=true to use Netlify Dev (port 8888)
// Otherwise uses local backend (port 5000)
const useNetlify = process.env.VITE_USE_NETLIFY === 'true'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Use esbuild for faster, dependency-free minification
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': useNetlify
        ? {
            // Netlify Dev proxy
            target: 'http://localhost:8888',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/.netlify/functions/api')
          }
        : {
            // Local backend proxy
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false
          }
    }
  }
})
