import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/oxyplot-js',
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
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
