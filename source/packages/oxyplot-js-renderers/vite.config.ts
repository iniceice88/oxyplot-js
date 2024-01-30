import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'oxyplot-js-renderers',
      fileName: 'oxyplot-js-renderers',
    },
  },
  plugins: [dts()],
})
