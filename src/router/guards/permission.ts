import type { Router } from 'vue-router'
import type { AppRoute } from '../types'

/** 根据路由标题更新浏览器标题。 */
function updateDocumentTitle(meta: AppRoute['Meta'] | undefined): void {
  const appTitle = import.meta.env.VITE_APP_TITLE?.trim() || 'Tauri Vue Template'
  document.title = meta?.title ? `${meta.title} - ${appTitle}` : appTitle
}

/** 注册模板级路由守卫；模板不内置鉴权、角色或权限判断。 */
export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    updateDocumentTitle(to.meta as AppRoute['Meta'] | undefined)
    return true
  })
}
