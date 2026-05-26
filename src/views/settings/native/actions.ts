import { appDataDir, downloadDir } from '@tauri-apps/api/path'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { check } from '@tauri-apps/plugin-updater'
import { filename, restoreStateCurrent, saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state'
import { shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { resolveApiBaseUrl } from '@/api/client'
import { available, desktop } from './runtime'

const pendingKey = {
  autostart: 'autostart',
  checkUpdate: 'check-update',
  openAppData: 'open-app-data',
  openDownloads: 'open-downloads',
  openUrl: 'open-url',
  saveWindowState: 'save-window-state',
  restoreWindowState: 'restore-window-state',
  windowMinimize: 'window-minimize',
  windowToggleMaximize: 'window-toggle-maximize',
  windowClose: 'window-close',
  windowDrag: 'window-drag',
  fsWrite: 'fs-write',
  fsRead: 'fs-read',
  fsMeta: 'fs-meta',
  uploadSample: 'upload-sample',
} as const

export type PendingKey = typeof pendingKey[keyof typeof pendingKey]

/** 当前正在执行的动作标识；使用固定 key，避免组件手写内部协议字符串。 */
export const actionPending = shallowRef<PendingKey | ''>('')

/** 最近一次原生能力错误；统一交给 native 设置分区展示。 */
export const errorMessage = shallowRef('')

/** 开机启动状态；只在桌面端 Tauri 环境下有真实值。 */
export const autostartEnabled = shallowRef<boolean | null>(null)

/** 更新检查状态文案。 */
export const updateStatus = shallowRef('未检查')

/** 检查到的新版本号。 */
export const updateVersion = shallowRef('')

/** window-state 插件使用的状态文件名。 */
export const windowStateFile = shallowRef('')

/** 刷新 native 分区直接展示的桌面系统状态。 */
export async function refreshSystemState(): Promise<void> {
  if (!desktop.value) {
    updateStatus.value = available.value ? '当前平台未启用桌面更新' : '未检查'
    return
  }

  autostartEnabled.value = await isEnabled()
  windowStateFile.value = await filename()
}

export async function toggleAutostart(nextValue: boolean): Promise<void> {
  await runDesktopAction(pendingKey.autostart, async () => {
    if (nextValue) {
      await enable()
    }
    else {
      await disable()
    }
    autostartEnabled.value = await isEnabled()
    toast.success(autostartEnabled.value ? '已开启开机启动' : '已关闭开机启动')
  })
}

/** 只检查更新状态，不下载也不安装，避免设置页初始化触发重型副作用。 */
export async function refreshUpdateStatus(options: { silent?: boolean } = {}): Promise<void> {
  await runDesktopAction(pendingKey.checkUpdate, async () => {
    updateStatus.value = '检查中'
    const update = await check({ timeout: 3500 })
    if (!update) {
      updateVersion.value = ''
      updateStatus.value = '已是最新版本'
      if (!options.silent) {
        toast.success('当前已是最新版本')
      }
      return
    }

    updateVersion.value = update.version
    updateStatus.value = `发现新版本 ${update.version}`
    if (!options.silent) {
      toast.info(`发现新版本 ${update.version}`)
    }
  }, options.silent)
}

export async function openAppDataDirectory(): Promise<void> {
  await runAction(pendingKey.openAppData, async () => {
    await openPath(await appDataDir())
  })
}

export async function openDownloadsDirectory(): Promise<void> {
  await runAction(pendingKey.openDownloads, async () => {
    await openPath(await downloadDir())
  })
}

export async function openProjectWebsite(): Promise<void> {
  await runAction(pendingKey.openUrl, async () => {
    await openUrl(resolveApiBaseUrl() || 'https://example.com')
  })
}

export async function saveCurrentWindowState(): Promise<void> {
  await runDesktopAction(pendingKey.saveWindowState, async () => {
    await saveWindowState(StateFlags.ALL)
    toast.success('窗口布局已保存')
  })
}

export async function restoreCurrentWindowState(): Promise<void> {
  await runDesktopAction(pendingKey.restoreWindowState, async () => {
    await restoreStateCurrent(StateFlags.ALL)
    toast.success('窗口布局已恢复')
  })
}

export async function minimizeCurrentWindow(): Promise<void> {
  await runDesktopAction(pendingKey.windowMinimize, () => getCurrentWindow().minimize())
}

export async function toggleCurrentWindowMaximize(): Promise<void> {
  await runDesktopAction(pendingKey.windowToggleMaximize, () => getCurrentWindow().toggleMaximize())
}

export async function closeCurrentWindow(): Promise<void> {
  await runDesktopAction(pendingKey.windowClose, () => getCurrentWindow().close())
}

export async function startWindowDrag(): Promise<void> {
  await runDesktopAction(pendingKey.windowDrag, () => getCurrentWindow().startDragging(), true)
}

/** 统一执行桌面端专属动作：Web 和移动端都会被明确拦截。 */
export async function runDesktopAction(action: PendingKey, task: () => Promise<void>, silent = false): Promise<void> {
  if (!desktop.value) {
    if (!silent) {
      toast.error(available.value ? '当前平台未启用桌面专属能力' : '当前是 Web 预览模式，原生能力仅在 Tauri App 内可用')
    }
    return
  }

  await runAction(action, task, silent)
}

/**
 * 统一执行 native 分区触发的原生动作。
 *
 * 这个边界负责：Web 预览模式拦截、按钮 pending 状态、错误记录和 toast 提示。
 * 具体业务动作不要重复实现这些横切逻辑。
 */
export async function runAction(action: PendingKey, task: () => Promise<void>, silent = false): Promise<void> {
  if (!available.value) {
    if (!silent) {
      toast.error('当前是 Web 预览模式，原生能力仅在 Tauri App 内可用')
    }
    return
  }

  actionPending.value = action
  errorMessage.value = ''
  try {
    await task()
  }
  catch (error) {
    setActionError(error)
    if (!silent) {
      toast.error(errorMessage.value)
    }
  }
  finally {
    actionPending.value = ''
  }
}

/** 记录原生能力错误；保留原始错误文案，交给页面决定如何展示。 */
export function setActionError(error: unknown): void {
  errorMessage.value = error instanceof Error ? error.message : String(error)
}

export function isPending(action: PendingKey): boolean {
  return actionPending.value === action
}

export const pending = pendingKey
