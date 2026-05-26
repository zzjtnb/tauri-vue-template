/**
 * template 应用的公共入口。
 *
 * 独立运行时使用本包自己的 main/router；公共出口只暴露本应用自己的页面路由、设置路由、公共路由和 Pinia 实例。
 */
export { pageRoutes } from '@/router/modules/pages'
export { publicRoutes } from '@/router/modules/public'
export { settingsRoutes } from '@/router/modules/settings'
export { pinia } from '@/stores'
