/**
 * examples 应用的公共入口。
 *
 * 独立运行时使用 apps/examples/src/router；公共出口只暴露本应用自己的路由模块。
 * 不从这里导出 App、router、main 或 Vite 配置，避免 Tauri 打包器误安装 examples 自己的应用运行态。
 */
export { publicRoutes } from '@/router/modules/public/base'
export { pageRoutes } from '@/views/routes'
