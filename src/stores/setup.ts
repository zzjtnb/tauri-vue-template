import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

/**
 * 全局 Pinia 实例。
 *
 * 模板只安装持久化插件；具体业务 Store 由使用者按模块自行新增。
 */
export const pinia = createPinia()

const storeKeyPrefix = import.meta.env.VITE_STORE_KEY_PREFIX?.trim() || 'tauri-template'

pinia.use(createPersistedState({
  key: storeName => `${storeKeyPrefix}:${storeName}`,
}))

export default pinia
