import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { resolve } from 'node:path'

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        testTimeout: 60_000 * 5,
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, './src')
        },
      },
    }),
  ),
)
