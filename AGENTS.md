# AGENTS.md

给在此仓库工作的 AI 编码 Agent 的指导说明。

## 项目概况

面向 Web、桌面端和移动端的 Tauri 2 + Vue 3 monorepo 模板工程。前端模板、示例应用和 Tauri 原生打包器拆成独立 workspace 包：`apps/template` 维护模板与设置页，`apps/examples` 维护示例页，`apps/tauri` 只负责多端原生打包，`packages/*` 提供公共 UI、主题、工具、静态资源和 CLI。

- 主要产品或服务：Tauri 2 + Vue 3 多端（Web / macOS / Windows / Linux / Android / iOS）应用模板
- 主要语言/框架：TypeScript、Vue 3、Vite、Rust、Tauri 2、UnoCSS、Pinia、Vue Router、Turborepo
- 包管理器：`pnpm`（当前版本见根 `package.json` 的 `packageManager` 字段），不要使用 `npm` 或 `yarn`
- 重要目录：
  - `apps/template`：模板应用（模板页、设置页、Mock、store、api）
  - `apps/examples`：示例应用（组件、主题、字体、Logo、布局演示）
  - `apps/tauri`：唯一 Tauri 多端打包入口（`src-tauri/`、原生配置）
  - `packages/cli`：工程化 CLI（格式化、Tauri 编排、发布）
  - `packages/ui`：公共 UI 包（shadcn-vue 组件、四种布局）
  - `packages/theme`：公共 UnoCSS 配置和共享样式
  - `packages/assets`：公共静态资源（favicon、Logo、splashscreen）
  - `packages/utils`：公共工具函数与 HTTP client
  - `docs/`：仓库级规范文档

## 命令

使用 `pnpm`，不要用 `npm` 或 `yarn`。

- 安装依赖：`pnpm install`
- 启动开发服务器（全部应用）：`pnpm dev`
- 只启动示例应用：`pnpm --filter @tauri-vue-template/examples dev`
- 只启动模板应用：`pnpm --filter @tauri-vue-template/template dev`
- 构建：`pnpm build`
- 运行 Lint（全项目）：`pnpm lint`
- 只运行 ESLint：`pnpm lint:eslint`
- 只运行 Stylelint：`pnpm lint:stylelint`
- 只运行 Markdownlint：`pnpm lint:markdownlint`
- 运行类型检查：`pnpm type-check`
- Rust check：`pnpm --dir apps/tauri rust:check`
- Rust clippy：`pnpm --dir apps/tauri rust:clippy`
- Tauri 桌面调试（示例）：`pnpm --filter @tauri-vue-template/cli tauri:target -- dev --target examples`

说明：优先对修改的包或文件运行最小范围的命令，不要默认跑全量测试。

## 代码规范

- 遵循周边文件的已有写法，保持代码风格一致。
- 优先复用已有组件（`packages/ui`）、工具函数（`packages/utils`）和样式系统（`packages/theme`），不要重复造轮子。
- 只做任务要求的改动，不做无关重构。
- 未经确认不要新增生产依赖；新增依赖需使用精确版本。
- 不要修改自动生成的文件：`apps/tauri/src-tauri/gen/**` 通过 `tauri:sync` 更新；`packages/ui/src/shadcn-vue/` 下除 `index.ts` 外均由 shadcn-vue CLI 生成，需更新时通过 CLI 重新生成。
- `packages/*` 通过 `exports` 解析到源码，应用 `dev` 和 `build` 不依赖这些包的 `dist`，不要为其配置指向 `dist` 的 alias 或 `dependsOn: ["^build"]`。
- 不在根 `pnpm build` 中触发 Tauri 原生打包（`.app`、`.dmg`、`.exe`、`.apk`、`.ipa`）。
- `apps/tauri` 不导入前端源码，只通过 Tauri config 的 `frontendDist` 指向构建产物。
- 遵循 `docs/guide/模块化编码规则.md`、`docs/guide/Turborepo任务规范.md`、`docs/guide/workspace内部包消费.md`。

## 安全规则

- 不要打印或提交密钥、Token、Cookie、私钥或任何凭证。
- 除非明确要求，不要修改 `.env.*`、部署配置或 CI 密钥。
- 不要执行破坏性数据库命令或数据回填脚本，改动前先确认。
- 修改 Tauri 权限能力声明（`apps/tauri/src-tauri/capabilities/`）前先说明影响范围。
- 不要修改 `apps/tauri/src-tauri/tauri.conf.json` 中的 `identifier` 和 `productName`，除非任务明确要求。

## 验证

完成编码任务前：

- 对修改的包或文件运行最小范围的 Lint 或类型检查。
- Rust 相关改动运行 `pnpm --dir apps/tauri rust:check` 和 `pnpm --dir apps/tauri rust:clippy`。
- 报告运行了哪个命令以及是否通过。
- 如果未能运行验证，说明原因和剩余风险。

## 已知坑点

- Tauri 平台脚本（`android:*`、`ios:*`、`harmony:*`）定义在 `apps/tauri/package.json`，根目录没有同名脚本，需通过 `pnpm --dir apps/tauri <脚本>` 或 `pnpm --filter @tauri-vue-template/cli tauri:target` 执行。
- Node.js 最低要求 `>=24.16.0`，Rust 最低要求见 `apps/tauri/src-tauri/Cargo.toml` 的 `rust-version`。
