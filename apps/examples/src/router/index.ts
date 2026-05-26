import { LayoutRuntime } from '@tauri-vue-template/ui'
import { createRouter, createWebHistory } from 'vue-router'
import * as routeModules from '@/router/modules'
import { createDynamicRouteRegistry } from './dynamic'
import { setupRouterGuards } from './guards/permission'

/**
 * 示例应用的常驻路由表。
 *
 * 使用公共 LayoutRuntime 生成布局路由，目的是验证公共布局包在真实 app 边界下可复用；
 * routeModules 只导入 examples 自己的页面和公共错误页，不读取其它应用的业务路由。
 */
const constantRoutes = LayoutRuntime.defineRoutes({
  modules: routeModules,
  publicRouteKeys: [],
  root: {
    // 根路径进入示例总览；示例详情页统一挂在 / 下，保持 examples app 内部路由命名不重复应用名。
    redirect: { name: 'home' },
  },
})

/** Vue Router 实例。 */
export const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

// LayoutRuntime 的上下文需要拿到最终路由树，才能生成菜单、面包屑、页签和区域覆盖关系。
// 这里按独立应用初始化布局上下文，只包含 examples 路由，避免模板页面出现在示例导航里。
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
