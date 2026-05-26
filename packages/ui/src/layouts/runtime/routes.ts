import type { RouteRecordRaw } from 'vue-router'
import type { Layout } from '../types/public'
import AppLayout from '../components/App.vue'

/**
 * 定义“整页接管 layout-content”的路由 components。
 * 使用者不需要记住 layout-content 命名视图，也不需要手写 default/layout-content 双份映射。
 */
export function defineContent<const T extends Layout['Area']['Component']>(component: T) {
  return {
    'default': component,
    'layout-content': component,
  }
}

/** 定义 AppLayout 根布局路由；普通项目只需要传 route modules 和根跳转。 */
export function defineRoutes(options: Layout['Route']['AppRoutesOptions']): RouteRecordRaw[] {
  const publicKeys = options.publicRouteKeys ?? ['publicRoutes']
  const suffix = options.routeExportSuffix ?? 'Routes'
  const publicRoutes = publicKeys.flatMap(key => routeList(options.modules[key]))
  const children = Object.entries(options.modules)
    .filter(([key]) => key.endsWith(suffix) && !publicKeys.includes(key))
    .flatMap(([, routes]) => routeList(routes))
  const { path = '/', name = 'root', ...root } = options.root ?? {}

  return [
    {
      path,
      name,
      ...root,
      component: AppLayout,
      children,
    },
    ...publicRoutes,
  ] as RouteRecordRaw[]
}

function routeList(input: unknown): Layout['Route']['RecordRaw'][] {
  return Array.isArray(input) ? input as Layout['Route']['RecordRaw'][] : []
}
