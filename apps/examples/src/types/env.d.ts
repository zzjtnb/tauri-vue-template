/// <reference types="vite/client" />

/**
 * UnoCSS Vite DevTools 虚拟模块声明。
 *
 * @unocss/vite 会在开发服务中解析 `virtual:unocss-devtools`，用于浏览器 DevTools 类名自动补全；
 * UnoCSS 66.7.0 没有随包暴露该虚拟模块的 TypeScript 声明，而项目开启了 noUncheckedSideEffectImports，
 * 因此需要在项目侧声明精确模块名，避免用 `virtual:*` 放宽所有虚拟模块检查。
 */
declare module 'virtual:unocss-devtools' {}

/** 共享主题样式包入口；examples 不维护重复 CSS token。 */
declare module '@tauri-vue-template/theme/styles' {}

/**
 * Vite 环境变量类型定义。
 *
 * 注意：Vite 暴露到 import.meta.env 的自定义变量均为字符串；
 * 布尔值、数字和默认值应在使用处显式解析。
 *
 * @see .env.example
 */
interface ImportMetaEnv {
  /** Vite dev server 端口，需要与 Tauri devUrl 端口保持一致。 */
  readonly VITE_APP_PORT?: string
  /** 项目展示标题，默认值由使用处兜底为“Tauri Vue Template”。 */
  readonly VITE_APP_TITLE?: string
  /** UnoCSS 配置调试开关；字符串 'true' 表示写出 resolved config。 */
  readonly VITE_DEBUG_UNOCSS_CONFIG?: string
  /** Tauri CLI 注入的平台调试信息，仅供 apps/tauri 聚合运行时使用。 */
  readonly [key: `TAURI_ENV_${string}`]: string | undefined
}

/**
 * Vite 注入到 import.meta 上的运行时元信息。
 */
interface ImportMeta {
  /** 当前构建模式下暴露给前端的环境变量集合。 */
  readonly env: ImportMetaEnv
}
