import { computed, readonly, shallowRef } from 'vue'
import {
  actionPending,
  autostartEnabled,
  closeCurrentWindow,
  errorMessage,
  isPending,
  minimizeCurrentWindow,
  openAppDataDirectory,
  openDownloadsDirectory,
  openProjectWebsite,
  pending,
  refreshSystemState,
  refreshUpdateStatus,
  restoreCurrentWindowState,
  saveCurrentWindowState,
  startWindowDrag,
  toggleAutostart,
  toggleCurrentWindowMaximize,
  updateStatus,
  updateVersion,
  windowStateFile,
} from './actions'
import {
  inspectFsMetaScopes,
  readSampleFile,
  sampleContent,
  samplePath,
  scopeMetas,
  uploadProgress,
  uploadSampleFile,
  uploadStatus,
  writeSampleFile,
} from './files'
import { available, desktop, initialize as initializeRuntime, platform } from './runtime'

const initialized = shallowRef(false)
const loading = shallowRef(false)

/**
 * 当前能力面板组合入口。
 *
 * 只给当前分区入口组件使用：组合 Tauri 运行态、桌面动作、文件读写和上传示例。
 * 不提供全局启动入口，也不要求 main.ts 启动时检查更新或触发原生副作用。
 */
export function usePanel() {
  const statusLabel = computed(() => {
    if (!available.value) {
      return 'Web 预览模式'
    }
    return desktop.value ? '桌面端 App' : '移动端 App'
  })
  const pendingState = {
    autostart: computed(() => isPending(pending.autostart)),
    checkUpdate: computed(() => isPending(pending.checkUpdate)),
    fsWrite: computed(() => isPending(pending.fsWrite)),
    fsRead: computed(() => isPending(pending.fsRead)),
    fsMeta: computed(() => isPending(pending.fsMeta)),
    uploadSample: computed(() => isPending(pending.uploadSample)),
  }

  return {
    state: {
      available: readonly(available),
      desktop: readonly(desktop),
      initialized: readonly(initialized),
      loading: readonly(loading),
      actionPending: readonly(actionPending),
      errorMessage: readonly(errorMessage),
      autostartEnabled: readonly(autostartEnabled),
      updateStatus: readonly(updateStatus),
      updateVersion: readonly(updateVersion),
      windowStateFile: readonly(windowStateFile),
      samplePath: readonly(samplePath),
      sampleContent: readonly(sampleContent),
      scopeMetas: readonly(scopeMetas),
      uploadStatus: readonly(uploadStatus),
      uploadProgress: readonly(uploadProgress),
      platform: readonly(platform),
      statusLabel,
      pending: pendingState,
    },
    actions: {
      initialize,
      toggleAutostart,
      refreshUpdateStatus,
      openAppDataDirectory,
      openDownloadsDirectory,
      openProjectWebsite,
      writeSampleFile,
      readSampleFile,
      inspectFsMetaScopes,
      uploadSampleFile,
      saveCurrentWindowState,
      restoreCurrentWindowState,
      minimizeCurrentWindow,
      toggleCurrentWindowMaximize,
      closeCurrentWindow,
      startWindowDrag,
    },
  }
}

async function initialize(): Promise<void> {
  if (initialized.value) {
    return
  }

  initialized.value = true
  loading.value = true
  try {
    await initializeRuntime()
    if (!available.value) {
      return
    }

    await refreshSystemState()
  }
  finally {
    loading.value = false
  }
}
