import { builtinModules } from 'node:module'
import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

const external = [
  ...builtinModules,
  ...builtinModules.map(name => `node:${name}`),
  ...Object.keys(packageJson.dependencies ?? {}),
]

export default defineConfig({
  entry: {
    unocss: 'src/unocss.ts',
  },
  format: 'esm',
  dts: true,
  clean: true,
  treeshake: true,
  outExtensions: () => ({ js: '.js' }),
  deps: {
    neverBundle: external,
  },
})
