/**
 * 示例应用路由模块公共出口。
 *
 * 只导出本应用自己的 public 路由和 examples 路由，不能导入 apps/tauri 的 settings/template 路由，
 * 否则示例应用会重新耦合模板核心页面，违背“示例独立应用”的拆分边界。
 */
export * from './public/base'
export * from '@/views/routes'
