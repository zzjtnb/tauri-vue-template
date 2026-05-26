import { builtinModules } from 'node:module'
import { defineConfig } from 'tsdown'

const external = [
  ...builtinModules,
  ...builtinModules.map(name => `node:${name}`),
]

export default defineConfig({
  entry: {
    validate: 'scripts/validate.ts',
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
