import { createRouter, createWebHistory } from 'vue-router'
import { LayoutRuntime } from '@/components/layouts'
import { createDynamicRouteRegistry } from './dynamic'
import { setupRouterGuards } from './guards/permission'
import { constantRoutes } from './routes'

/** Vue Router 实例。 */
export const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

const layoutRoutes = [...router.options.routes]
const layoutContext = LayoutRuntime.context.get(layoutRoutes)
LayoutRuntime.context.set({
  ...layoutContext,
  routes: layoutRoutes,
})

export const { addDynamicRoutes, resetDynamicRoutes } = createDynamicRouteRegistry(router)

/** Router 运行时对象入口；路由实例、动态路由操作集中挂在同一个对象下。 */
export const RouterRuntime = {
  instance: router,
  dynamic: {
    addRoutes: addDynamicRoutes,
    reset: resetDynamicRoutes,
  },
} as const

setupRouterGuards(router)

export default router
