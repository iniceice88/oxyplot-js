import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'dev',
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'OxyplotRenderersPdf',
        fileName: 'oxyplot-js-renderers-pdf',
      },
      rollupOptions: {
        external: ['oxyplot-js', 'oxyplot-js-renderers', 'jspdf'],
        output: {
          globals: {
            'oxyplot-js-renderers': 'oxyplot-js-renderers',
            'oxyplot-js': 'oxyplot-js',
            jspdf: 'jspdf',
          },
        },
      },
    },
    plugins: [dts()],
  }
})
