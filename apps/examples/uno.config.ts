import type { ThemeUnoConfigOptions } from '@tauri-vue-template/theme/unocss'
import { createUnoConfig } from '@tauri-vue-template/theme/unocss'

const options: ThemeUnoConfigOptions = {
  appRoot: import.meta.dirname,
  iconsDir: 'src/assets/icons',
}

export default createUnoConfig(options)
