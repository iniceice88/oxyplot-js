import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'dev',
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'Oxyplot',
        fileName: 'oxyplot-js',
      },
      rollupOptions: {
        external: ['dayjs', 'image-js'],
        output: {
          globals: {
            dayjs: 'dayjs',
            'image-js': 'image-js',
          },
        },
      },
    },
    resolve: {
      alias: {
        '@/patch': resolve(__dirname, 'src/patch'),
        '@/oxyplot': resolve(__dirname, 'src/oxy'),
      },
    },
    plugins: [
      dts({
        include: ['src'],
      }),
    ],
  }
})
