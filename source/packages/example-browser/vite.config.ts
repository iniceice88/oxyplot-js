import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/oxyplot-js',
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string, meta: any /* ManualChunkMeta */) => {
          if (id.includes('/node_modules/')) {
            if (id.includes('/oxyplot-js/')) {
              return 'oxyplot-js'
            }
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
