import type { App, Plugin } from 'vue'
import IconPickerSource from './IconPicker.vue'

export const IconPicker = IconPickerSource as typeof IconPickerSource & Plugin

IconPicker.install = (app: App) => {
  app.component('IconPicker', IconPicker)
}

export default IconPicker

export * from './collection'
export * from './icon-picker'
