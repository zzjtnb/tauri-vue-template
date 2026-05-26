import type { Router, RouteRecordRaw } from 'vue-router'

export interface DynamicRouteRegistry {
  addDynamicRoutes: (routes: RouteRecordRaw[]) => void
  resetDynamicRoutes: () => void
}

/**
 * 创建动态路由注册表。
 *
 * 仅负责运行时动态路由的注册、名称记录和重置；路由实例文件只持有最终导出的操作入口。
 */
export function createDynamicRouteRegistry(router: Router): DynamicRouteRegistry {
  /** 动态路由名称集合，用于模板扩展场景下精确移除运行时路由。 */
  const dynamicRouteNames = new Set<string>()

  /** 注册动态路由，并记录路由名称以便后续重置。 */
  function addDynamicRoutes(routes: RouteRecordRaw[]): void {
    for (const route of routes) {
      router.addRoute(route)
      if (route.name) {
        dynamicRouteNames.add(String(route.name))
      }
    }
  }

  /** 移除已注册的动态路由。 */
  function resetDynamicRoutes(): void {
    for (const name of dynamicRouteNames) {
      if (router.hasRoute(name)) {
        router.removeRoute(name)
      }
    }
    dynamicRouteNames.clear()
  }

  return {
    addDynamicRoutes,
    resetDynamicRoutes,
  }
}
