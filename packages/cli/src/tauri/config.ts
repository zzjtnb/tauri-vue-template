/**
 * Tauri app target 配置唯一入口。
 *
 * `apps/tauri/src-tauri/tauri.conf.json` 是官方 Tauri 默认配置，当前代表 examples。
 * 本文件只维护本项目 CLI 额外认识的 app target：默认目标可只保留空覆盖，
 * 非默认目标声明需要覆盖的 Tauri 配置字段。
 */
import type { TauriConfig } from '#/types/tauri.ts'

export interface AppTargetDefinition {
  /** 稳定目标名，作为 CLI `--target` 参数和 release 目录名。 */
  name: string
  /** 展示给使用者看的目标名称。 */
  label: string
  /** 叠加到 apps/tauri/src-tauri/tauri.conf.json 的覆盖配置。 */
  config: TauriConfig
}

export const defaultTarget = 'examples'

export const appTargetDefinitions = [
  {
    name: 'examples',
    label: '示例',
    config: {},
  },
  {
    name: 'template',
    label: '模板',
    config: {
      productName: '模板',
      identifier: 'com.zzjtnb.template',
      build: {
        frontendDist: '../../template/dist',
        devUrl: 'http://localhost:3001',
        beforeDevCommand: 'pnpm --dir ../.. --filter @tauri-vue-template/template dev',
        beforeBuildCommand: 'pnpm --dir ../.. --filter @tauri-vue-template/template build',
      },
      app: {
        windows: [
          {
            title: '模板',
            width: 800,
            height: 600,
            resizable: true,
            fullscreen: false,
          },
        ],
      },
    },
  },
] as const satisfies AppTargetDefinition[]
