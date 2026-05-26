/// <reference types="vite/client" />

/**
 * UnoCSS Vite DevTools 虚拟模块声明。
 *
 * @unocss/vite 会在开发服务中解析 `virtual:unocss-devtools`，用于浏览器 DevTools 类名自动补全；
 * UnoCSS 66.7.0 没有随包暴露该虚拟模块的 TypeScript 声明，而项目开启了 noUncheckedSideEffectImports，
 * 因此需要在项目侧声明精确模块名，避免用 `virtual:*` 放宽所有虚拟模块检查。
 */
declare module 'virtual:unocss-devtools' {}

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
  /** 前端请求前缀；开发代理或 Mock 场景通常为 /dev-api。 */
  readonly VITE_APP_BASE_API?: string
  /** 后端接口地址；开发代理时作为 proxy target，直连场景作为请求 base URL。 */
  readonly VITE_APP_API_URL?: string
  /** Pinia 持久化 key 前缀，用于隔离不同项目或环境的本地缓存。 */
  readonly VITE_STORE_KEY_PREFIX?: string
  /** Mock 服务开关；字符串 'true' 表示启用。 */
  readonly VITE_MOCK_DEV_SERVER?: string
  /** HTTP 调试日志开关；字符串 'true' 表示输出接口调试日志。 */
  readonly VITE_APP_DEBUG?: string
  /** 路由来源模式：本地、远端或混合。 */
  readonly VITE_ROUTE_SOURCE?: 'local' | 'remote' | 'hybrid'
  /** UnoCSS 配置调试开关；字符串 'true' 表示写出 resolved config。 */
  readonly VITE_DEBUG_UNOCSS_CONFIG?: string
  /** 原生 upload 插件示例上传地址；需要是 http/https 绝对地址。 */
  readonly VITE_UPLOAD_DEMO_URL?: string
}

/**
 * Vite 注入到 import.meta 上的运行时元信息。
 */
interface ImportMeta {
  /** 当前构建模式下暴露给前端的环境变量集合。 */
  readonly env: ImportMetaEnv
}

/**
 * 构建期注入的应用信息。
 *
 * 由 vite.config.ts 从 package.json 和当前构建上下文生成，
 * 通过 Vite define 注入到前端代码中。
 */
declare const __APP_INFO__: {
  /** package.json 中的项目元信息。 */
  pkg: {
    /** package.json 的 name 字段。 */
    name: string
    /** package.json 的 version 字段。 */
    version: string
    /** package.json 的 engines 字段。 */
    engines: {
      /** 项目要求的 Node.js 版本范围。 */
      node: string
    }
    /** package.json 的 dependencies 字段。 */
    dependencies: Record<string, string>
    /** package.json 的 devDependencies 字段。 */
    devDependencies: Record<string, string>
  }
  /** 构建时间戳，值为生成配置时的 Date.now()。 */
  buildTimestamp: number
  /** 当前 Vite mode，例如 development 或 production。 */
  mode: string
}
