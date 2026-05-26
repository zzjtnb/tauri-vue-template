# @tauri-vue-template/cli

`@tauri-vue-template/cli` 是本仓库的工程化命令包。它把格式化选择器、Tauri 多目标构建、移动端生成工程同步、发布产物归档和少量本地 workspace 辅助命令收敛到可类型检查、可直接执行的 TypeScript 文件内。

这个包的根层 `index.ts` 只做公共导出聚合，不承担命令路由。仓库内调用优先使用 `package.json` scripts；需要直接调试时，可以执行对应功能文件本身。

## 公开入口

| 入口 | 稳定性 | 说明 |
| --- | --- | --- |
| `index.ts` | 公共导出入口 | 只聚合 `src/tauri/index.ts`、`src/workspace/index.ts` 公开的必要函数。 |
| `pnpm --filter @tauri-vue-template/cli <script>` | 仓库内脚本入口 | 给 workspace 包、根脚本和人工命令使用。 |
| `src/<domain>/<command>.ts` | 具体命令入口 | 命令文件自己判断是否被直接执行；不存在额外路由层。 |

## 命令

| 命令 | 说明 | 主要副作用 |
| --- | --- | --- |
| `format` | 打开格式化选择器；支持交互模式和非交互输入。 | 执行所选包的 `lint:*` 修复任务。 |
| `tauri:deps -- [check\|openharmony\|plugin\|help] [--target <name>]` | 不传子命令时进入交互菜单；CLI 模式可指定目标项目后检查或同步 npm 包与 Cargo crate。 | 检查模式不修改；更新模式会修改依赖文件并执行安装。 |
| `tauri:sync -- [--target <name>]` | 不传参数时交互式单选目标；CLI 模式按目标 Tauri config 同步 Android / iOS / OpenHarmony 生成工程元信息。 | 修改 `apps/tauri/src-tauri/gen/**`。 |
| `tauri:target -- [command] [--target <names>]` | 不传参数时交互式选择命令和目标；CLI 模式把项目级目标命令转换为实际 Tauri CLI / Cargo Tauri 命令。 | 构建前端 `dist/`、Tauri bundle 或移动端生成工程。 |
| `tauri:release -- [command]` | 打开发布菜单，构建并归档产物，或签名 updater 更新包。 | 修改 `release/**`，签名时生成或更新 `.sig`。 |
| `exclude-local [add\|del] [items...]` | 同步 `.git/info/exclude` 中的本地排除项。 | 修改本地 Git exclude，不影响仓库提交内容。 |
| `kill-port [ports...]` | 释放本地端口，默认处理 `3000` 和 `3001`。 | 对占用端口的本机进程发送 `SIGTERM` / `SIGKILL`。 |

## Tauri 目标命令

`tauri:target` 不传参数时进入交互式流程：先选择项目级目标命令，再按命令类型从 `packages/cli/src/tauri/config.ts` 读取应用目标并单选或多选。传参时第一个位置参数是项目级目标命令：

| 命令 | 说明 |
| --- | --- |
| `targets` | 列出 `packages/cli/src/tauri/config.ts` 中的应用目标。 |
| `dev` | 桌面调试，只允许单个应用目标。 |
| `macos` | 构建 macOS `.dmg`。 |
| `windows` | 构建 Windows NSIS `.exe`。 |
| `linux` | 构建 Linux `.deb`。 |
| `android-dev` / `android-run` / `android` | Android 调试、运行和打包。 |
| `ios-dev` / `ios-run` / `ios` | iOS 调试、运行和打包，仅 macOS 可用。 |
| `harmony-dev` / `harmony` | OpenHarmony 调试和打包。 |

示例：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target
pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples,template
pnpm --filter @tauri-vue-template/cli tauri:target -- targets
pnpm --filter @tauri-vue-template/cli tauri:sync
pnpm --filter @tauri-vue-template/cli tauri:sync -- --target examples
pnpm --filter @tauri-vue-template/cli tauri:deps
pnpm --filter @tauri-vue-template/cli tauri:deps -- check --target examples
```

透传额外 Tauri CLI 参数时使用 `--tauri` 分隔，避免和本 CLI 自己的 `--target` 冲突：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples --tauri --debug
```

## release 目录结构

`tauri:release` 使用应用目标、版本、平台和产物类型四个稳定维度归档：

```text
release/
  manifest.json
  logs/
    <timestamp>-<scope>.log
  apps/
    <app-target>/
      v<version>/
        <platform>/
          bundle/
          updater/
  imported/
    <import-batch>/
      <platform>/
        bundle/
```

| 目录 | 来源 | 说明 |
| --- | --- | --- |
| `release/apps/<app>/v<version>/<platform>/bundle/` | 本次构建的安装包或分发包。 | `.dmg`、`.exe`、`.deb`、`.apk`、`.aab`、`.ipa`、OpenHarmony `.hap` / `.app` 等产物；macOS `.app`、Windows `.msi`、Linux `.rpm` / `.AppImage` 这类非当前发布目标不归档。 |
| `release/apps/<app>/v<version>/<platform>/updater/` | 本次构建的 updater 包和签名。 | `.tar.gz`、`.zip` 与对应 `.sig` 放在同一目录。 |
| `release/imported/<batch>/<platform>/bundle/` | “只移动已有产物”菜单导入的旧产物。 | 不伪造 app 和 version，用导入批次隔离来源。 |
| `release/manifest.json` | 发布索引元数据。 | 记录应用目标、版本、平台、产物类型和 release 相对路径；它不是安装包，但用于核对、上传和签名流程。 |
| `release/logs/<timestamp>-<scope>.log` | 每次打包的完整日志。 | 记录本次 release 命令范围、宿主平台、实际 Tauri/Cargo 命令输出、每个 app/platform 的耗时、退出状态和归档产物路径。 |

签名菜单只扫描 `release/apps/**/updater/` 下的 `.tar.gz` 和 `.zip`，避免误签普通 bundle 或导入产物。
打包命令会在本轮 release 开始时按应用目标并行预构建前端，并为每个 app/platform 创建 `.tmp/release-builds/<app>-<platform>/` 隔离目录执行原生构建，避免重复 Vue build，也避免多个移动端目标并行时互相覆盖 `src-tauri/gen/**`。
Android 默认只构建 `aarch64`；只有显式传入 `--abi universal` 才构建全部 ABI。更详细的内部设计见 `src/tauri/README.md`。
打包命令会在终端输出统计摘要，并把同一轮构建的完整日志写入 `release/logs/`，便于全平台打包失败后按 app/platform 回溯。

### 非交互发布命令

交互菜单仍然是默认入口；需要脚本化验证 release 目录结构时，可以直接传入子命令：

| 命令 | 对应菜单项 | 说明 |
| --- | --- | --- |
| `tauri:release -- platform <platform> [--abi aarch64\|universal] [--jobs <n>]` | 按平台批量打包 | 为指定平台打包全部应用目标，只覆盖当前版本对应平台目录。 |
| `tauri:release -- app <target> <platform> [--abi aarch64\|universal] [--jobs <n>]` | 按应用和平台打包 | 只打包指定应用目标和平台，只覆盖该目标当前版本的指定平台目录。 |
| `tauri:release -- all [--abi aarch64\|universal] [--jobs <n>]` | 打包全部平台的全部应用目标 | 只覆盖各应用当前版本对应平台目录，适合验证完整归档结构。 |
| `tauri:release -- move-existing` | 只移动已有打包产物 | 把已有产物移动到 `release/imported/<batch>/`。 |
| `tauri:release -- sign-updater` | 签名 updater 更新包 | 扫描 `release/apps/**/updater/` 下的可签名更新包。 |
| `tauri:release -- clean` | 清理当前版本产物 | 删除各应用当前 version 目录，保留历史版本和 imported。 |
| `tauri:release -- list` / `tauri:release -- matrix` | 打印命令矩阵 | 只打印带注释的非交互 release 命令，不执行打包。 |
| `tauri:release -- help` | 打印帮助 | 只打印用法、当前宿主可用平台和应用目标，不执行打包。 |

需要查看可复制的非交互命令时，直接使用 release 命令自身输出：

```bash
pnpm --filter @tauri-vue-template/cli tauri:release -- list
pnpm --filter @tauri-vue-template/cli tauri:release -- help
```

## 包内导入规则

包内源码使用 Node 官方 Subpath Imports。跨目录源码引用走 `#/*`，同级文件继续使用相对路径：

```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

示例：

```ts
import { runSync } from '#/utils.ts'
import type { TauriConfig } from '#/types/tauri.ts'
```

不要新增 `#tauri/*`、`#utils/*`、`#types/*` 这类并行别名；跨目录运行时代码和类型通过 `#/*` 寻址，例如 `#/tauri/target.ts`、`#/types/tauri.ts`。同级 re-export 和配置文件读取本地文件时使用相对路径。

## 设计边界

- CLI 只读取仓库约定路径：`apps/`、`packages/`、`apps/tauri`、`packages/assets`。
- CLI 不维护前端业务路由、组件、store 或真实业务配置。
- Tauri 应用目标唯一来源是 `packages/cli/src/tauri/config.ts`。
- Tauri 生成工程同步一次只能代表一个移动端目标；`--target all` 会被拒绝。
- 发布菜单只负责本地交互编排、产物归档和 updater 签名辅助；实际构建复用 `src/tauri/target.ts` 的平台命令矩阵和 `tauriCommandParts`，但在 release sandbox 中直接执行。
- `kill-port` 是本地开发辅助命令，只适合开发机使用，不应放进 CI。

## 安全约束

- updater 签名密码只通过 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 注入；CLI 不读取、不缓存、不打印密码。
- 私钥可以通过 Tauri 环境变量或交互输入的私钥文件路径提供；CLI 只校验路径存在。
- `exclude-local` 只修改 `.git/info/exclude`，不会修改 `.gitignore`。
- 命令执行使用 `spawn` / `spawnSync` 参数数组，不通过 shell 拼接执行用户输入。

## 开发

安装依赖：

```bash
pnpm install
```

类型检查：

```bash
pnpm --filter @tauri-vue-template/cli type-check
```

直接执行具体命令文件：

```bash
node packages/cli/src/tauri/target.ts targets
```

可选打包检查：

```bash
pnpm --filter @tauri-vue-template/cli build
```

## 验证

CLI 变更至少验证：

| 路径 | 推荐命令 |
| --- | --- |
| 类型契约 | `pnpm --filter @tauri-vue-template/cli type-check` |
| 可选打包检查 | `pnpm --filter @tauri-vue-template/cli build` |
| Tauri 目标解析 | `node packages/cli/src/tauri/target.ts targets` |
| 全项目 lint | 从仓库根目录执行 `pnpm lint` |

如未验证长驻命令（例如 `dev`、`android-dev`、`ios-dev`、`harmony-dev`），需要在提交说明中明确原因，因为这些命令会启动 dev server 或设备调试流程。
