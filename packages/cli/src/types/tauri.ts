import type nodeProcess from 'node:process'
import type { RunOutput } from '#/types/shell.ts'

export type HostPlatform = typeof nodeProcess.platform

/** Android release 默认只构建 aarch64；显式 universal 才保留全 ABI。 */
export type AndroidAbi = 'aarch64' | 'universal'

/** 解析后的外部 Tauri/Cargo 命令。 */
export interface TauriCommandParts {
  /** 实际执行器，例如 pnpm 或 cargo。 */
  runner: string
  /** 传给执行器的参数数组，不经过 shell 拼接。 */
  args: string[]
}

/** 生成 Tauri/Cargo 命令时的项目级覆盖选项。 */
export interface TauriCommandOptions {
  /** Android ABI 策略；未传时保持 Tauri CLI 默认行为。 */
  androidAbi?: AndroidAbi
}

/** 项目级发布平台；同时约束 target 命令和 release 产物扫描。 */
export interface TauriPlatform {
  /** 归档时识别的可发布产物后缀。 */
  extensions: readonly string[]
  /** 展示名称。 */
  label: string
  /** 稳定平台命令名，例如 macos、android。 */
  name: string
  /** 命令限制运行的平台；不匹配时在交互和非交互入口禁用。 */
  onlyOn?: HostPlatform
  /** release 需要扫描的 Tauri 输出目录。 */
  outputs: readonly string[]
  /** 是否需要在执行前同步移动端生成工程元信息。 */
  sync?: boolean
}

/** 经过校验和路径解析后的 Tauri 应用目标。 */
export interface AppTarget {
  /** 叠加到官方基础配置的目标覆盖配置。 */
  config: TauriConfig
  /** 配置来源说明，用于错误信息和目标列表展示。 */
  configSource: string
  /** 展示名称，例如“模板”或“示例”。 */
  label: string
  /** 稳定目标名，作为 CLI `--target` 参数和 release 目录名。 */
  name: string
}

/** `tauri:target` 命令注册表中的单个命令配置。 */
export interface TargetCommandConfig {
  /** 展示给使用者的命令说明。 */
  label: string
  /** 命令是否不需要选择应用目标，例如 targets 列表命令。 */
  noTarget?: boolean
  /** 命令限制运行的平台；不匹配时直接报错。 */
  onlyOn?: HostPlatform
  /** 不执行外部进程的内部动作，例如打印目标列表。 */
  run?: () => void
  /** 是否只能选择单个应用目标；用于 dev/run 这类长驻或设备调试命令。 */
  singleTarget?: boolean
  /** 执行前后是否同步移动端生成工程元信息。 */
  sync?: boolean
}

/** 复用 `tauri:target` 执行能力时的可选参数。 */
export interface TargetRunOptions {
  /** 透传给实际 Tauri CLI / Cargo Tauri 的额外参数。 */
  passthroughArgs?: string[]
  /** 旁路记录实际构建命令输出；release 日志文件使用这个入口。 */
  output?: RunOutput
}

/** 单个 Tauri 应用目标的一次实际构建命令执行结果。 */
export interface TargetRunResult {
  /** 实际执行参数，不包含 runner。 */
  args: string[]
  /** 项目级命令名，例如 macos、android 或 harmony。 */
  command: string
  /** 命令结束时间，ISO 字符串。 */
  endedAt: string
  /** 命令展示名称。 */
  label: string
  /** 外部执行器，例如 pnpm 或 cargo。 */
  runner: string
  /** 命令开始时间，ISO 字符串。 */
  startedAt: string
  /** 子进程退出码；0 表示成功。 */
  status: number
  /** 本次执行的应用目标。 */
  target: AppTarget
  /** 子进程耗时，单位毫秒。 */
  timeMs: number
}

/** JSON 对象边界类型；用于表达已确认是对象但字段仍来自外部配置。 */
export type JsonRecord = Record<string, unknown>

/** CLI 同步生成工程时关心的 Tauri 配置字段。 */
export interface TauriConfig {
  /** Tauri config schema 地址；目标覆盖配置通常继承基础配置。 */
  $schema?: unknown
  /** 应用窗口和安全配置；其它 Tauri app 字段按原样保留。 */
  app?: JsonRecord & {
    /** 安全配置会同步到 OpenHarmony 生成配置。 */
    security?: unknown
    /** 主窗口列表；同步标题时只读取第一个窗口的 title。 */
    windows?: ReadonlyArray<JsonRecord & { title?: unknown }>
  }
  /** 打包配置；同步 OpenHarmony 生成配置时按对象整体浅合并。 */
  build?: JsonRecord
  /** bundle 配置；同步 OpenHarmony 生成配置时按对象整体浅合并。 */
  bundle?: JsonRecord
  /** 原生应用 identifier / bundle id。 */
  identifier?: unknown
  /** 原生应用产品名。 */
  productName?: unknown
  /** 应用版本号。 */
  version?: unknown
}
