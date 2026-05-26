import type { Application } from '@/types/app'
import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

/** 将 env 字符串读取为布尔值。 */
function readBoolean(value: string | boolean | undefined): boolean {
  return value === true || value === 'true' || value === '1'
}

/** 将 env 字符串读取为数字；无效值统一返回 null。 */
function readNumber(value: string | number | undefined): number | null {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const env = import.meta.env
const { pkg } = __APP_INFO__

/**
 * 模板级应用 Store。
 *
 * 只保存应用元信息和 env 派生配置，不承载账号、权限、业务数据或远端菜单。
 */
export const useAppStore = defineStore('app', () => {
  const system = reactive<Application['SystemInfo']>({
    name: pkg.name,
    version: pkg.version,
    title: env.VITE_APP_TITLE?.trim() || pkg.name,
    mode: env.MODE,
    dev: env.DEV,
    prod: env.PROD,
  })

  const envConfig = reactive<Application['EnvConfig']>({
    appPort: readNumber(env.VITE_APP_PORT),
    appBaseApi: env.VITE_APP_BASE_API?.trim() || '',
    appApiUrl: env.VITE_APP_API_URL?.trim() || '',
    storeKeyPrefix: env.VITE_STORE_KEY_PREFIX?.trim() || 'tauri-template',
    uploadDemoUrl: env.VITE_UPLOAD_DEMO_URL?.trim() || '',
    mockDevServer: readBoolean(env.VITE_MOCK_DEV_SERVER),
    debug: readBoolean(env.VITE_APP_DEBUG),
    unoCssConfigDebug: readBoolean(env.VITE_DEBUG_UNOCSS_CONFIG),
    routeSource: env.VITE_ROUTE_SOURCE?.trim() || 'local',
  })

  const pageTitle = computed(() => system.title || system.name)
  const apiBaseUrl = computed(() => envConfig.appBaseApi || envConfig.appApiUrl)

  function updateDocumentTitle(title = pageTitle.value): void {
    document.title = title
  }

  return {
    system,
    envConfig,
    pageTitle,
    apiBaseUrl,
    updateDocumentTitle,
  }
})
