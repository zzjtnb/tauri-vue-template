import { LayoutRuntime } from '@/components/layouts'
import * as routeModules from '@/router/modules'

/** 常驻路由：模板主框架为默认入口，示例库保持独立路由。 */
export const constantRoutes = LayoutRuntime.defineRoutes({
  modules: routeModules,
  publicRouteKeys: [],
  root: {
    redirect: { name: 'template-selection' },
  },
})
