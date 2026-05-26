# Tauri Vue Template

一个面向 Web、桌面端和移动端的 Tauri 2 + Vue 3 monorepo 模板工程。仓库把前端模板、示例应用和 Tauri 原生打包器拆成独立 workspace 包：`apps/template` 维护模板与设置页，`apps/examples` 维护示例页，`apps/tauri` 只负责复用同一套 `src-tauri` 打包不同前端产物。

> 当前仓库是模板/示例工程，不包含真实业务账号、权限系统、远端菜单或生产后端服务。

## 特性

- **Tauri 2 多端基础**：覆盖 Web、macOS、Windows、Linux、Android、iOS，并保留 OpenHarmony / 鸿蒙实验链路。
- **Vue 3 前端栈**：Vue 3、Vue Router、Pinia、VueUse、TypeScript、Vite、UnoCSS。
- **Turborepo workspace**：应用放在 `apps/*`，公共能力放在 `packages/*`，根脚本只通过 `turbo run` 分发包级任务。
- **独立模板应用**：`apps/template` 拥有模板选择页、设置页、Mock API、Pinia store 和 Tauri 原生能力示例。
- **独立示例应用**：`apps/examples` 拥有组件、主题、Logo、字体和布局系统演示，不再混入模板核心路由。
- **单一 Tauri 打包器**：`apps/tauri` 是唯一多端原生工程；它不维护前端路由、视图或 store，只通过不同 Tauri config 指向模板或示例构建产物。
- **公共 UI 与布局系统**：`packages/ui` 作为唯一 UI 包根入口，聚合 shadcn-vue 源码组件、自研组件，以及 `topnav`、`sidebar`、`hybrid`、`blank` 四种布局和区域扩展机制。
- **公共工具包**：`packages/utils` 提供 HTTP client 与通用工具。
- **公共主题包**：`packages/theme` 维护共享 UnoCSS 配置和样式入口，应用侧只保留薄配置引用。
- **公共静态资源包**：`packages/assets` 维护默认 favicon、Logo 和 splashscreen，模板、示例和 Tauri 工具链不再各自复制一份。
- **工程化 CLI**：`packages/cli` 统一承载格式化选择器、Tauri 多目标构建、发布菜单和本地 workspace 辅助命令。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3、Vue Router、Pinia、VueUse |
| 构建工具 | Vite、TypeScript、vue-tsc、Turborepo、pnpm workspace |
| 样式 | UnoCSS、shadcn-vue、reka-ui、lucide-vue-next |
| 桌面/移动 | Tauri 2、Rust |
| 原生插件 | opener、fs、os、upload、log、autostart、updater、window-state |
| 开发辅助 | vite-plugin-mock-dev-server、ESLint、Stylelint、markdownlint-cli2 |

## 环境要求

- Node.js：`>=24.16.0`（不低于当前最新 LTS；本地可使用 Node 26）
- pnpm：以根 `package.json` 的 `packageManager` 为准（当前为 `pnpm@11.5.1`）
- Rust：`apps/tauri/src-tauri/Cargo.toml` 当前要求 `rust-version = "1.77.2"`
- Tauri 依赖环境：不同平台需要安装对应系统依赖，详见 `apps/tauri/docs/guide/`

移动端额外要求：

- Android：Android Studio、Android SDK、NDK、模拟器或真机环境。
- iOS：macOS + Xcode 完整安装。
- Windows 构建 `.exe`：需要在 Windows 环境执行 Tauri desktop build。
- Linux 构建包：需要目标发行版相关打包依赖。
- OpenHarmony / 鸿蒙：当前使用 Tauri OpenHarmony 相关 git 分支和 patch，属于实验链路。

## 快速开始

安装依赖：

```bash
pnpm install
```

同时启动示例和模板 Web 开发服务（**无需**先构建 `packages/theme`、`packages/ui`、`packages/utils` 的 `dist`）：

```bash
pnpm dev
```

示例应用是端口基准，默认端口是 `3000`；模板应用顺延到 `3001`：

```text
http://localhost:3000/
http://localhost:3001/
```

只启动某个 Web 应用时使用 pnpm workspace filter，不在根脚本里为每个应用复制别名：

```bash
pnpm --filter @tauri-vue-template/examples dev
pnpm --filter @tauri-vue-template/template dev
```

### Tauri 平台脚本（Android / iOS / 鸿蒙 / 桌面）

`android:*`、`ios:*`、`harmony:*` 等定义在 `apps/tauri/package.json`，根目录没有同名脚本。两种写法等价：

```bash
# 方式 A：在 apps/tauri 内
cd apps/tauri && pnpm android:build

# 方式 B：在仓库根
pnpm --dir apps/tauri android:build
```

平台接入文档里若只写 `pnpm android:*`，默认指方式 A。细则见 `apps/tauri/README.md` 与 `apps/tauri/docs/guide/配置文件指南.md`。

启动 Tauri 模板桌面调试。`apps/tauri` 只保留默认 Tauri 包脚本，多应用目标通过 `packages/cli` 的 Tauri 目标命令执行：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- dev --target template
```

构建 Web 产物：

```bash
pnpm build
```

产物：

| 产物 | 说明 |
| --- | --- |
| `apps/template/dist/` | 模板应用的 Web 静态产物。 |
| `apps/examples/dist/` | 示例应用的 Web 静态产物。 |
| `packages/assets/public/`、`packages/assets/dist/validate.js` | 校验必需共享静态资源是否存在且非空，并用 tsdown 输出资源校验脚本。 |
| `apps/tauri/src-tauri/target/` | 只执行 Rust check；根 `pnpm build` 不生成 `.app`、`.dmg`、`.exe`、`.msi`、`.apk` 或 `.ipa`。 |

查看可打包的 Tauri 应用目标：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- targets
```

产物：

| 产物 | 说明 |
| --- | --- |
| 终端输出 | 列出 `packages/cli/src/tauri/config.ts` 中声明的应用目标和默认目标。 |
| 文件产物 | 不生成、不修改文件。 |

构建 macOS 默认 Tauri 应用目标：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- macos
```

产物：

| 产物 | 说明 |
| --- | --- |
| `apps/examples/dist/` | 当前默认目标是 `examples`，会先构建示例应用 Web 静态产物。 |
| `apps/tauri/src-tauri/target/universal-apple-darwin/release/bundle/dmg/` | macOS `.dmg` 安装包目录，文件名以当前 Tauri 配置的 productName 和 version 为准。 |

构建 macOS 多个 Tauri 应用目标：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples,template
```

产物：

| 产物 | 说明 |
| --- | --- |
| `apps/template/dist/` | `template` 目标的 Web 静态产物。 |
| `apps/examples/dist/` | `examples` 目标的 Web 静态产物。 |
| `apps/tauri/src-tauri/target/universal-apple-darwin/release/bundle/dmg/` | macOS 模板 / 示例 `.dmg` 安装包。 |

构建 macOS 全部 Tauri 应用目标：

```bash
pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target all
```

产物：

| 产物 | 说明 |
| --- | --- |
| 每个目标对应的前端 `dist/` | 为 `packages/cli/src/tauri/config.ts` 中全部应用目标分别构建 Web 静态产物。 |
| macOS `.dmg` | 为全部应用目标生成 `.dmg`，输出到 `apps/tauri/src-tauri/target/universal-apple-darwin/release/bundle/dmg/`。 |

打开发布菜单，选择应用目标和平台，把打包产物按应用目标、版本、平台和产物类型移动到根目录 `release/`，或对 updater 更新包执行签名：

```bash
pnpm --filter @tauri-vue-template/cli tauri:release
```

产物：

| 产物 | 说明 |
| --- | --- |
| `apps/tauri/src-tauri/target/**/bundle/` | 菜单选择构建时，会先生成 Tauri bundle。 |
| `release/apps/<应用目标>/v<版本>/<平台>/bundle/` | 把本轮新增或变化的安装包移动到按版本隔离的发布归档。 |
| `release/apps/<应用目标>/v<版本>/<平台>/updater/` | 归档 updater 更新包和对应 `.sig`。 |
| `release/imported/<导入批次>/<平台>/bundle/` | “只移动已有产物”菜单导入的旧产物，不伪造应用目标和版本。 |
| `release/manifest.json` | 发布索引元数据；记录应用目标、版本、平台、产物类型和 release 相对路径，用于核对、上传和签名流程。 |
| `release/logs/<时间戳>-<范围>.log` | 每次打包的完整日志；记录实际命令输出、每个 app/platform 的耗时、退出状态和归档产物路径，结构化调试段使用 `node:util.inspect` 保留更多诊断信息。 |

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 通过 Turborepo 启动所有带 `dev` 脚本的 workspace 包；不先构建内部包 `dist`。 |
| `pnpm --filter @tauri-vue-template/examples dev` | 只启动示例应用开发服务，默认端口 `3000`。 |
| `pnpm --filter @tauri-vue-template/template dev` | 只启动模板应用开发服务，默认端口 `3001`。 |
| `pnpm build` | 通过 Turborepo 构建所有带 `build` 脚本的 workspace 包；应用 Web 产物在 `apps/*/dist/`，内部包 `dist/` 仅作包级校验；`packages/assets` 校验共享静态资源；`apps/tauri` 只执行 Rust check。 |
| `pnpm --filter @tauri-vue-template/template build` | 只构建模板应用 Web 产物（直接打包 workspace 源码，不依赖 `packages/*/dist`），输出 `apps/template/dist/`。 |
| `pnpm --filter @tauri-vue-template/examples build` | 只构建示例应用 Web 产物（直接打包 workspace 源码），输出 `apps/examples/dist/`。 |
| `pnpm type-check` | 执行各 workspace 包自己的类型/契约检查；Vue / TypeScript 包执行类型检查，`apps/tauri` 执行 Rust check，`packages/assets` 校验共享静态资源。 |
| `pnpm format` | 通过 `packages/cli` 打开交互式格式化选择器，可多选 ESLint、Stylelint、Markdownlint 和项目。 |
| `pnpm preview` | 通过 Turborepo 预览所有带 `preview` 脚本的 workspace 包；单应用预览使用 pnpm filter。 |
| `pnpm --filter @tauri-vue-template/cli tauri:target -- targets` | 查看 `packages/cli/src/tauri/config.ts` 中声明的应用目标；不生成文件产物。 |
| `pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples,template` | 顺序构建 macOS 多个应用目标；会更新对应前端 `dist/`，原生包产物输出到 macOS bundle 目录；`--target all` 表示全部目标。 |
| `pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target all` | 顺序构建 macOS 全部应用目标，输出 macOS `.dmg`；`windows`、`linux`、`android`、`ios`、`harmony` 会输出各平台对应的安装包或生成工程产物。 |
| `pnpm --filter @tauri-vue-template/cli tauri:target -- dev --target examples` | 启动指定应用目标的桌面调试；通常只复用前端 dev server 与 Rust dev 构建缓存，不产生发布安装包；Android / iOS / OpenHarmony 调试使用 `android-dev`、`ios-dev`、`harmony-dev`。 |
| `pnpm --filter @tauri-vue-template/cli tauri:sync -- --target examples` | 将移动端生成工程同步到指定应用目标；产物是 `apps/tauri/src-tauri/gen/**` 下 Android / iOS / OpenHarmony 生成工程里的名称、identifier、窗口标题等元信息更新。 |
| `pnpm --filter @tauri-vue-template/cli tauri:release` | 打开发布菜单；菜单先按应用目标并行预构建一次前端，再为每个 app/platform 创建 `.tmp/release-builds/<app>-<platform>/` 隔离目录并行执行原生构建；Android 默认只打 `aarch64`，传 `--abi universal` 才打全部 ABI。最后把新增或变化的安装包移动到 `release/apps/<应用目标>/v<版本>/<平台>/bundle/`，updater 更新包和 `.sig` 放到同平台 `updater/`，并维护 `release/manifest.json` 与 `release/logs/<时间戳>-<范围>.log` 打包日志。 |
| `pnpm --filter @tauri-vue-template/cli tauri:release -- list` | 打印 Tauri release 非交互命令矩阵；执行 `all`、`platform <平台>` 或 `app <目标> <平台>` 才会真实打包。 |
| `pnpm --dir apps/tauri tauri:info` | 在 Tauri 包内查看 Tauri 环境信息。 |
| `pnpm --dir apps/tauri android:init` | 在 Tauri 包内初始化 Android 工程；iOS 和 OpenHarmony 使用 `ios:init`、`harmony:init`。 |
| `pnpm lint` | 通过根任务执行全项目 ESLint、Stylelint、Markdownlint 和 Tauri Rust lint；Rust 会在 `apps/tauri` 包内顺序执行 format 与 clippy。 |
| `pnpm lint:tui` | 使用 Turborepo TUI 交互界面执行同一组全项目 lint 任务，适合本地查看多任务日志。 |
| `pnpm lint:eslint` | 在根目录对全项目执行 ESLint format / fix。 |
| `pnpm lint:stylelint` | 在根目录对全项目执行 Stylelint format / fix。 |
| `pnpm lint:markdownlint` | 在根目录对全项目执行 Markdownlint format / fix。 |
| `pnpm exec eslint apps/template --fix --cache --cache-location node_modules/.cache/.eslintcache --config eslint.config.ts` | 只对指定目录执行 ESLint format / fix；按需把路径替换为 `apps/*`、`packages/theme` 等范围。 |
| `pnpm exec stylelint "apps/template/**/*.{css,scss,vue,html}" --config stylelint.config.ts --fix --cache --cache-location node_modules/.cache/.stylelintcache` | 只对指定目录执行 Stylelint format / fix。 |
| `pnpm exec markdownlint-cli2 --config .markdownlint-cli2.jsonc --fix "apps/template/**/*.md"` | 只对指定目录执行 Markdownlint format / fix。 |
| `pnpm --dir apps/tauri rust:fmt` | 在 Tauri 包内执行 Rust format。 |
| `pnpm --dir apps/tauri rust:check` | 在 Tauri 包内执行 Rust check。 |
| `pnpm --dir apps/tauri rust:clippy` | 在 Tauri 包内执行 Rust clippy。 |
| `pnpm --dir apps/tauri rust:test` | 在 Tauri 包内执行 Rust 测试。 |

## 环境变量

模板应用环境变量示例在 `apps/template/.env.example` 中。常用项：

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_PORT` | 模板 Vite 开发服务端口，默认 `3001`，需与模板 Tauri config 的 `devUrl` 保持一致。 |
| `VITE_APP_TITLE` | 前端展示用应用名称，不等同于 Tauri 原生 `productName`。 |
| `VITE_APP_BASE_API` | 前端请求前缀，例如 `/dev-api`。 |
| `VITE_APP_API_URL` | 后端接口地址；开发代理和 App 直连场景会用到。 |
| `VITE_UPLOAD_DEMO_URL` | Tauri upload 插件示例上传地址，必须是 App 可访问的绝对 URL。 |
| `VITE_STORE_KEY_PREFIX` | 本地持久化 key 前缀。 |
| `VITE_MOCK_DEV_SERVER` | 是否启用本地 Mock 服务。 |
| `VITE_APP_DEBUG` | 是否输出接口调试日志。 |
| `VITE_DEBUG_UNOCSS_CONFIG` | 是否输出 UnoCSS resolved config 到 `backup/unocss`。 |
| `VITE_ROUTE_SOURCE` | 路由来源预留配置，默认 `local`。 |

本地开发可以复制示例文件后按需修改：

```bash
cp apps/template/.env.example apps/template/.env.development
```

## Tauri 配置

主要配置文件：

- `apps/tauri/src-tauri/tauri.conf.json`：Tauri 官方默认配置文件；直接运行 `apps/tauri` 包内裸 Tauri 脚本时读取它，当前默认指向示例应用。
- `packages/cli/src/tauri/config.ts`：本项目多应用目标配置入口；`tauri:target`、`tauri:sync`、`tauri:deps`、`tauri:release` 都从这里读取应用目标。
- `apps/tauri/src-tauri/Cargo.toml`：Rust 包、Tauri 依赖、插件依赖和 OpenHarmony patch。
- `apps/tauri/src-tauri/capabilities/`：Tauri v2 权限能力声明。
- `apps/tauri/src-tauri/src/lib.rs`：Tauri builder、插件注册和命令注册。

当前默认 `apps/tauri/src-tauri/tauri.conf.json` 中的原生应用信息：

```json
{
  "productName": "示例",
  "identifier": "com.zzjtnb.examples",
  "build": {
    "frontendDist": "../../examples/dist",
    "devUrl": "http://localhost:3000"
  }
}
```

发布自己的应用前，请同步修改：

1. `apps/tauri/package.json` 的 `name`、`version`、`description`。
2. 对应前端应用的 `.env.example` / `.env.*` 展示名称、接口配置和 Mock 配置。
3. `apps/tauri/src-tauri/tauri.conf.json` 的默认应用信息，或在 `packages/cli/src/tauri/config.ts` 新增多应用目标覆盖配置。
4. 新增目标后执行 `pnpm --filter @tauri-vue-template/cli tauri:target -- targets` 检查是否被识别。
5. 执行 `pnpm --filter @tauri-vue-template/cli tauri:sync -- --target <目标名>`，把 Android、iOS 和 OpenHarmony 生成工程同步到指定目标。
6. `apps/tauri/src-tauri/Cargo.toml` 的 package 信息、authors、license、repository。
7. `packages/assets/public/` 中的默认静态资源，以及 `apps/tauri/src-tauri/icons/` 中的原生图标资源。

## 项目结构

```text
.
├── apps/
│   ├── template/         # 独立模板应用：模板页面、设置页、Mock、store、api、Vite 和 UnoCSS 薄入口
│   ├── examples/         # 独立示例应用：组件、主题、字体、Logo 和布局演示
│   └── tauri/            # 唯一 Tauri 多端打包入口：public、src-tauri、docs、原生图标和 Tauri 配置
├── packages/
│   ├── cli/              # 工程化 CLI：格式化、Tauri 编排、发布和本地 workspace 辅助命令
│   ├── ui/               # 公共 UI 包：shadcn-vue、布局、IconPicker（`src/shadcn-vue`、`src/layouts`）
│   ├── theme/            # 公共 UnoCSS 配置和共享样式
│   ├── assets/           # 公共静态资源：favicon、Logo、splashscreen
│   └── utils/            # 公共工具函数与 HTTP client
├── docs/                 # 仓库级规范文档
├── turbo.json            # Turborepo 任务管线
└── pnpm-workspace.yaml   # pnpm workspace 包边界
```

## 内置页面

模板应用 `apps/template`：

- `/`：模板选择页。
- `/topnav`：顶部导航模板。
- `/sidebar`：侧边栏布局模板。
- `/hybrid`：混合布局模板。
- `/blank`：空白布局模板。
- `/workspace`：智能工作台自定义模板。
- `/settings`：设置页，包含主题布局、桌面与文件、系统信息。

示例应用 `apps/examples`：

- `/`：示例总览。
- `/fonts`：字体系统演示。
- `/themes`：主题配色演示。
- `/shadcn`：shadcn-vue 组件演示。
- `/card`：虚拟信用卡示例。
- `/logo`：Logo 编辑器演示。
- `/layout`：布局系统演示。

## Mock API

Mock 文件位于 `apps/template/mock/`。开发时设置：

```env
VITE_MOCK_DEV_SERVER=true
```

即可启用本地 Mock 服务。模板内置示例包括：

- `apps/template/mock/template/status.ts`
- `apps/template/mock/template/echo.ts`
- `apps/template/mock/template/upload.ts`
- `apps/template/mock/template/auth/login.ts`
- `apps/template/mock/template/auth/logout.ts`
- `apps/template/mock/template/auth/register.ts`

## Workspace 内部包消费

`packages/theme`、`packages/ui`、`packages/utils` 只在 monorepo 内使用，不发布 npm。应用 `dev` 与 `build` 通过各包 `package.json` 的 `exports` 解析到 **源码**，不消费内部包 `dist`。

- 应用依赖：各 app `package.json` 中 `"@tauri-vue-template/<name>": "workspace:*"`。
- 样式：`import '@tauri-vue-template/theme/styles'`（应用 `main.ts`）。
- UnoCSS：`uno.config.ts` 从 `@tauri-vue-template/theme/unocss` 导入 `createUnoConfig`（不要从包根 `.` 导入）。
- Vite：不为 `@tauri-vue-template/*` 配置指向 `dist` 的 alias；仅保留 `@ui/*` → `packages/ui/src/*`。
- Turbo：`dev` 与应用的 `build` 均不 `dependsOn: ["^build"]`。

细则见 `docs/guide/workspace内部包消费.md`。

## TypeScript 与路由边界

- 根 `tsconfig.json` 不枚举所有 workspace 包，避免包数量增长后手写维护 `references`。
- 每个应用只维护自己的 `@` alias，分别指向本应用 `src`；`@ui/*` 仅用于解析 ui 包内部路径，不为 `@tauri-vue-template/*` 在应用 tsconfig 中重复写相对路径。
- 类型检查由 Turborepo 调用各包自己的 `type-check` 脚本；应用内 `tsconfig.json` 只引用本应用的 `tsconfig.app.json` 和 `tsconfig.node.json`。
- `apps/tauri` 不导入前端源码，不聚合模板或示例路由，只通过 Tauri config 的 `frontendDist` 指向对应应用构建产物。

## 文档入口

| 文档 | 说明 |
| --- | --- |
| `docs/README.md` | 仓库级文档索引。 |
| `docs/guide/模块化编码规则.md` | 项目模块化编码规则。 |
| `docs/guide/Turborepo任务规范.md` | Turborepo 任务边界和根脚本规范。 |
| `docs/guide/workspace内部包消费.md` | 内部包 `exports`、Vite 与 Turbo 约定（dev/build 不走 `dist`）。 |
| `apps/tauri/README.md` | Tauri 脚本索引；Android / iOS / 鸿蒙 **两种命令写法**（根目录 vs `apps/tauri` 内）。 |
| `apps/tauri/docs/guide/配置文件指南.md` | Tauri 配置标准与命令执行目录。 |
| `apps/tauri/docs/dev.md` | Tauri 开发说明。 |
| `apps/tauri/docs/cli/` | Tauri CLI 命令说明。 |
| `apps/tauri/docs/guide/` | macOS、Windows、Linux、Android、iOS、OpenHarmony 等平台接入指南。 |

## License

MIT
