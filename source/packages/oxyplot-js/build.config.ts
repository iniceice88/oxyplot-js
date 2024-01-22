import { defineBuildConfig } from 'unbuild'
import { resolve } from 'node:path'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  sourcemap: true,
  failOnWarn:false,
  entries: [
    {
      input: './src/index',
      name: 'oxyplot-js',
    },
  ],
  rollup: {
    emitCJS: true,
  },
  alias: {
    '@/patch': resolve(__dirname, 'src/patch'),
    '@/oxyplot': resolve(__dirname, 'src/oxy/internal'),
  },
})
