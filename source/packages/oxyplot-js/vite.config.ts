import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'dev',
      minify: mode === 'prod',
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'oxyplot-js',
        fileName: 'oxyplot-js',
      },
      rollupOptions: {
        external: ['dayjs', 'image-js', 'xmlbuilder2'],
        output: {
          globals: {
            dayjs: 'dayjs',
            'image-js': 'image-js',
            xmlbuilder2: 'xmlbuilder2',
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
