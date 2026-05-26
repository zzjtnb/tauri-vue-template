import { isTauri } from '@tauri-apps/api/core'
import { arch, locale, platform as platformName, version } from '@tauri-apps/plugin-os'
import { shallowRef } from 'vue'

/** Tauri 平台快照；当前只由 native 设置分区展示。 */
export interface PlatformSnapshot {
  name: string
  arch: string
  version: string
  locale: string
}

const checked = shallowRef(false)

/** 当前是否运行在 Tauri 桌面/移动端容器内。 */
export const available = shallowRef(false)

/** 当前是否是桌面端 Tauri 容器；窗口、更新、开机启动等能力只在桌面端启用。 */
export const desktop = shallowRef(false)

/** 当前 Tauri 容器的平台快照；Web 预览模式保持为空。 */
export const platform = shallowRef<PlatformSnapshot | null>(null)

/**
 * 初始化 native 设置分区需要的 Tauri 运行态。
 *
 * 这里只记录“是否在 Tauri 内”和“当前平台快照”；文件、窗口、更新等副作用
 * 由用户进入设置页后按需触发，不放进 main.ts 全局启动流程。
 */
export async function initialize(): Promise<void> {
  if (checked.value) {
    return
  }

  available.value = isTauri()
  desktop.value = false
  checked.value = true
  if (!available.value) {
    return
  }

  const currentPlatform = platformName()
  const currentLocale = await locale()
  desktop.value = ['macos', 'windows', 'linux'].includes(currentPlatform)
  platform.value = {
    name: currentPlatform,
    arch: arch(),
    version: version(),
    locale: currentLocale || 'unknown',
  }
}
