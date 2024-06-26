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
  ]
})
