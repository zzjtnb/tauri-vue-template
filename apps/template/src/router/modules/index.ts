/**
 * 模板应用路由模块公共出口。
 *
 * template app 自己维护页面、设置和公共错误页；Tauri 打包器不反向导入这些源码。
 */
export * from './pages'
export * from './public'
export * from './settings'
