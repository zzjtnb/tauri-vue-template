import { builtinModules } from 'node:module'
import { defineConfig } from 'tsdown'

const external = [
  ...builtinModules,
  ...builtinModules.map(name => `node:${name}`),
]

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    http: 'src/http/index.ts',
    node: 'src/node/index.ts',
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
