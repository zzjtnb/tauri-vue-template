/** 应用运行元信息公共类型契约。 */

interface InternalAppSystemInfo {
  // 应用包名。
  name: string
  // 应用版本号。
  version: string
  // 应用显示标题。
  title: string
  // 当前 Vite 运行模式。
  mode: string
  // 是否为开发环境。
  dev: boolean
  // 是否为生产环境。
  prod: boolean
}

interface InternalAppEnvConfig {
  // Vite 开发服务端口。
  appPort: number | null
  // 应用 API 基础路径。
  appBaseApi: string
  // 应用 API 目标地址。
  appApiUrl: string
  // Store 持久化 key 前缀。
  storeKeyPrefix: string
  // 原生上传示例地址。
  uploadDemoUrl: string
  // 是否启用 mock dev server。
  mockDevServer: boolean
  // 是否开启应用调试。
  debug: boolean
  // 是否写出 UnoCSS resolved config。
  unoCssConfigDebug: boolean
  // 路由来源模式原始 env 值。
  routeSource: string
}

/** 应用类型根对象；统一通过 `Application['SystemInfo']` 等对象路径读取。 */
export interface Application {
  // 应用包信息和运行模式。
  SystemInfo: InternalAppSystemInfo
  // 从 env 派生的运行配置快照。
  EnvConfig: InternalAppEnvConfig
}
