/**
 * 跨运行时基础工具公共入口。
 *
 * 本入口只导出纯 TypeScript 能力，不依赖 Node、Vue、Tauri 或具体业务模块。
 */
export * from './number.ts'
export * from './string.ts'
export * from './time.ts'
export type * from './types.ts'
