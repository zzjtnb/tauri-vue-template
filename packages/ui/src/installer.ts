import type { App, Component, Plugin } from 'vue'
import { IconPicker } from './components/icon-picker'
import { AppLayout, LayoutSettings, LayoutSettingsTrigger } from './layouts'
import * as Shadcn from './shadcn-vue'

type InstallableComponent = Component & { name?: string, __name?: string }

function isInstallableComponent(value: unknown): value is InstallableComponent {
  return typeof value === 'object'
    && value !== null
    && ('setup' in value || 'render' in value || '__name' in value || 'install' in value)
}

export const install: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries({
      ...Shadcn,
      AppLayout,
      LayoutSettings,
      LayoutSettingsTrigger,
      IconPicker,
    })) {
      if (isInstallableComponent(component)) {
        app.component(name, component)
      }
    }
  },
}

export default install
