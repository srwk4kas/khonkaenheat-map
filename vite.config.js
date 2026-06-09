import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  server: {
    proxy: {
      '/tmd-api': {
        target: 'http://www.aws-observation.tmd.go.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmd-api/, ''),
      },
      '/tmd-weather': {
        target: 'https://data.tmd.go.th',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.path = '/api/Weather3Hours/v2/?uid=api&ukey=api12345';
          });
        },
      },
    },
  },
})
