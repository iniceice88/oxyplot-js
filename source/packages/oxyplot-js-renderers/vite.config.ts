import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'dev',
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'oxyplot-js-renderers',
        fileName: 'oxyplot-js-renderers',
      },
      rollupOptions: {
        external: ['image-js', 'xmlbuilder2', 'oxyplot-js', 'jspdf'],
        output: {
          globals: {
            'image-js': 'image-js',
            xmlbuilder2: 'xmlbuilder2',
            'oxyplot-js': 'oxyplot-js',
            jspdf: 'jspdf',
          },
        },
      },
    },
    plugins: [dts()],
  }
})
