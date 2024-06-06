import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'dev',
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'OxyplotRenderers',
        fileName: 'oxyplot-js-renderers',
      },
      rollupOptions: {
        external: ['xmlbuilder2', 'oxyplot-js'],
        output: {
          globals: {
            xmlbuilder2: 'xmlbuilder2',
            'oxyplot-js': 'oxyplot-js',
          },
        },
      },
    },
    plugins: [dts()],
  }
})
