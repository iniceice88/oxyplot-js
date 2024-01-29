import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'oxyplot-js',
      fileName: 'oxyplot-js',
    },
  },
  resolve: {
    alias: {
      '@/patch': resolve(__dirname, 'src/patch'),
      '@/oxyplot': resolve(__dirname, 'src/oxy/internal'),
    },
  },
  plugins: [dts()],
})
