# Tauri CLI 模块

本目录是 `packages/cli` 中面向 `apps/tauri` 的命令边界。这里不再维护多层私有目录；根层文件就是稳定入口，内部流程通过同文件内的私有函数收敛，避免把一次命令流程拆成过多小模块。

## 职责

- 读取 `packages/cli/src/tauri/config.ts`，把多个前端应用目标映射为同一个 Tauri 打包器可消费的配置。
- 同步移动端 `src-tauri/gen/**` 生成工程元信息。
- 检查和同步 Tauri npm 包与 Cargo crate 版本线。
- 执行项目级 Tauri target 命令；无参数时进入交互式命令和目标选择。
- 执行 release 归档、日志、manifest、清理、导入已有产物和 updater 签名。

不负责：

- 维护前端业务路由、store、页面或组件。
- 在 `apps/tauri` 中承载任意前端 app 源码。
- 缓存 Cargo、Gradle 或 Vite 的内部实现；release 只通过前端预构建和 sandbox 降低重复工作。

## 文件边界

| 路径 | 职责 |
| --- | --- |
| `config.ts` | Tauri app target 定义和默认目标；是目标名、展示名和配置覆盖的唯一真实来源。 |
| `target.ts` | Tauri app target 解析、平台命令/产物矩阵、目标配置合并、`tauri:target` 包脚本执行。 |
| `sync.ts` | 同步 Android、iOS、OpenHarmony 生成工程元信息；同一时间只允许单个移动端目标。 |
| `deps.ts` | 检查和同步 Tauri npm/Cargo 依赖版本线。 |
| `release.ts` | 完整 release 命令流程：参数、平台矩阵、前端预构建、sandbox、打包、归档、manifest、清理、导入和签名。 |
| `README.md` | 当前模块边界说明。 |

## Target 规则

`config.ts` 是应用目标唯一真实来源。`target.ts` 对外提供共享解析能力：

- 默认目标来自 `config.ts` 的 `defaultTarget`。
- `--target all` 展开为全部目标。
- 逗号分隔目标按顺序展开。
- 无参数交互模式自动读取全部目标；调试和运行命令单选，构建命令多选。
- 目标配置会叠加基础 `src-tauri/tauri.conf.json`；数组整体覆盖，不做拼接。
- `examples` 是默认目标，放在目标列表第一位；覆盖配置为空，直接继承 `apps/tauri/src-tauri/tauri.conf.json`，避免示例配置维护两份。

## Release 规则

release 产物按版本归档：

```text
release/
  manifest.json
  logs/
  apps/
    <app-target>/
      v<version>/
        <platform>/
          bundle/
          updater/
  imported/
    <batch>/
      <platform>/
        bundle/
```

关键约束：

- `bundle/` 只放可发布安装包或分发包，不保留 macOS `.app` 这类中间包。
- `updater/` 只放 updater 更新包和签名文件。
- `clean` 只清理每个应用当前版本目录，保留历史版本和 `imported/`。
- Android 默认只构建 `aarch64`；只有显式 `--abi universal` 才保留 Tauri 全 ABI 行为。
- 原生构建在 `.tmp/release-builds/<app>-<platform>/` sandbox 中执行，避免多个移动端目标同时污染主工程 `src-tauri/gen/**`。
- updater 签名密码只能通过 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 注入；脚本不会读取、缓存或打印密码。

## 验证

修改本目录后至少运行：

```bash
pnpm --filter @tauri-vue-template/cli type-check
pnpm exec eslint packages/cli --fix --cache --cache-location node_modules/.cache/.eslintcache --config eslint.config.ts
pnpm --filter @tauri-vue-template/cli build
node packages/cli/src/tauri/target.ts targets
```

真实打包耗时长，不作为默认验证。需要验证真实产物时，优先由维护者手动执行单个 app/platform。
