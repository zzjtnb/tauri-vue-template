# Tauri Vue Template

一个面向 Web、桌面端和移动端的 Tauri 2 + Vue 3 模板工程。项目内置路由驱动布局系统、模板选择页、设置页、Mock API、Tauri 原生能力示例和多平台构建脚本，适合用作跨端应用的起点。

> 当前仓库是模板/示例工程，不包含真实业务账号、权限系统、远端菜单或生产后端服务。

## 特性

- **Tauri 2 多端基础**：覆盖 Web、macOS、Windows、Linux、Android、iOS，并保留 OpenHarmony / 鸿蒙实验链路。
- **Vue 3 前端栈**：Vue 3、Vue Router、Pinia、VueUse、TypeScript、Vite、UnoCSS。
- **布局系统**：内置 `topnav`、`sidebar`、`hybrid`、`blank` 四种布局，并支持区域预设、命名视图、slots、设置面板和页签。
- **模板选择页**：默认入口 `/` 展示多个模板骨架，包括顶部导航、侧边栏、混合布局、空白布局和智能工作台。
- **设置页拆分**：按主题布局、桌面与文件、系统信息拆分设置能力；Web 环境会自动隐藏不可用原生能力。
- **原生能力示例**：集成文件读写、上传、系统信息、窗口状态、开机启动、更新检查等 Tauri 插件示例。
- **Mock API**：开发环境可启用本地 Mock，便于快速验证模板接口、登录注册和上传示例。
- **工程化脚本**：内置类型检查、前端构建、Tauri 构建、Rust 检查、ESLint、Stylelint、Markdown lint。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3、Vue Router、Pinia、VueUse |
| 构建工具 | Vite、TypeScript、vue-tsc |
| 样式 | UnoCSS、shadcn-vue、reka-ui、lucide-vue-next |
| 桌面/移动 | Tauri 2、Rust |
| 原生插件 | opener、fs、os、upload、log、autostart、updater、window-state |
| 开发辅助 | vite-plugin-mock-dev-server、ESLint、Stylelint、markdownlint-cli2 |

## 环境要求

- Node.js：`>=24.16.0`
- pnpm：项目声明为 `pnpm@11.1.3`
- Rust：`src-tauri/Cargo.toml` 当前要求 `rust-version = "1.77.2"`
- Tauri 依赖环境：不同平台需要安装对应系统依赖，详见 `docs/tauri/guide/`

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

启动 Web 开发服务：

```bash
pnpm dev
```

默认开发端口是 `3000`，访问：

```text
http://localhost:3000/
```

启动 Tauri 桌面调试：

```bash
pnpm tauri:dev
```

构建 Web 产物：

```bash
pnpm build
```

构建当前平台 Tauri 桌面包：

```bash
pnpm tauri:build
```

打开发布菜单，选择要打包的平台，把已有打包产物移动到根目录 `release/`，或对 updater 更新包执行签名：

```bash
pnpm tauri:release
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite dev server。 |
| `pnpm build` | 执行 Vue 类型检查并构建 Web 产物。 |
| `pnpm type-check` | 执行 Vue / TypeScript 类型检查。 |
| `pnpm preview` | 预览 Web 构建产物。 |
| `pnpm tauri:info` | 查看 Tauri 环境信息。 |
| `pnpm tauri:deps` | 检查或同步 Tauri npm 包与 Cargo crate 依赖。 |
| `pnpm tauri:icon` | 使用 `public/logo.png` 生成 Tauri 图标。 |
| `pnpm tauri:signer` | 调用 Tauri signer；签名密码只通过环境变量注入。 |
| `pnpm tauri:dev` | 启动 Tauri 桌面调试。 |
| `pnpm tauri:build` | 构建当前平台桌面安装包。 |
| `pnpm tauri:release` | 打开发布菜单，选择打包平台、移动已有产物到 `release/`，或签名 updater 更新包。 |
| `pnpm android:init` | 初始化 Tauri Android 工程。 |
| `pnpm android:dev` | 启动 Android 调试。 |
| `pnpm android:build` | 构建 Android 产物。 |
| `pnpm android:run` | 在 Android 设备或模拟器运行。 |
| `pnpm ios:init` | 初始化 Tauri iOS 工程。 |
| `pnpm ios:dev` | 启动 iOS 调试。 |
| `pnpm ios:build` | 构建 iOS 产物。 |
| `pnpm ios:run` | 在 iOS 设备或模拟器运行。 |
| `pnpm mac:dev` | 启动 macOS 桌面调试。 |
| `pnpm mac:build` | 构建 macOS universal app / dmg。 |
| `pnpm windows:dev` | 启动 Windows 桌面调试。 |
| `pnpm windows:build` | 构建 Windows x64 nsis / msi。 |
| `pnpm linux:dev` | 启动 Linux 桌面调试。 |
| `pnpm linux:build` | 构建 Linux deb / rpm / appimage。 |
| `pnpm harmony:init` | 初始化 OpenHarmony / 鸿蒙实验工程。 |
| `pnpm harmony:dev` | 启动 OpenHarmony / 鸿蒙实验调试。 |
| `pnpm harmony:build` | 构建 OpenHarmony / 鸿蒙实验产物。 |
| `pnpm clean` | 清理 Web 构建产物、缓存和 Rust target。 |
| `pnpm lint` | 执行前端、Rust 和 Markdown lint。 |
| `pnpm lint:eslint` | 执行 ESLint 自动修复。 |
| `pnpm lint:stylelint` | 执行 Stylelint 自动修复。 |
| `pnpm lint:markdownlint` | 执行 Markdownlint 自动修复。 |
| `pnpm lint:frontend` | 执行 ESLint 和 Stylelint。 |
| `pnpm lint:backend` | 执行 Rust fmt 和 clippy。 |
| `pnpm rust:check` | 执行 Rust check。 |
| `pnpm rust:clippy` | 执行 Rust clippy。 |
| `pnpm rust:test` | 执行 Rust 测试。 |

## 环境变量

环境变量示例在 `.env.example` 中。常用项：

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_PORT` | Vite 开发服务端口，默认 `3000`，需与 `src-tauri/tauri.conf.json` 的 `devUrl` 保持一致。 |
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
cp .env.example .env.development
```

## Tauri 配置

主要配置文件：

- `src-tauri/tauri.conf.json`：唯一默认 Tauri 配置入口，包含应用名称、版本、identifier、前端入口、窗口、CSP、bundle icon 和平台默认字段。
- `src-tauri/Cargo.toml`：Rust 包、Tauri 依赖、插件依赖和 OpenHarmony patch。
- `src-tauri/capabilities/`：Tauri v2 权限能力声明。
- `src-tauri/src/lib.rs`：Tauri builder、插件注册和命令注册。

当前项目不维护 `src-tauri/tauri.android.conf.json`、`src-tauri/tauri.ios.conf.json`、`src-tauri/tauri.linux.conf.json`、`src-tauri/tauri.macos.conf.json`、`src-tauri/tauri.windows.conf.json`。长期平台默认值写在 `src-tauri/tauri.conf.json` 的 `bundle.*` 分区；临时 Beta、企业版或渠道构建使用显式 `--config`。

当前 `tauri.conf.json` 示例中的原生应用信息：

```json
{
  "productName": "争逐",
  "identifier": "com.zzjtnb.zzjt",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build"
  },
  "bundle": {
    "targets": "all"
  }
}
```

发布自己的应用前，请同步修改：

1. `package.json` 的 `name`、`version`、`description`。
2. `.env.example` / `.env.*` 中的前端展示名称和接口配置。
3. `src-tauri/tauri.conf.json` 的 `productName`、`identifier`、窗口和 bundle 配置。
4. `src-tauri/Cargo.toml` 的 package 信息、authors、license、repository。
5. `public/` 和 `src-tauri/icons/` 中的图标资源。

## 项目结构

```text
.
├── docs/                 # 项目文档、Tauri CLI/多平台接入说明
├── mock/                 # 本地 Mock API
├── public/               # 静态资源
├── scripts/              # 工程脚本
├── src/                  # Vue 前端源码
│   ├── api/              # 请求封装和接口类型
│   ├── assets/           # 样式、主题 token 和静态资源
│   ├── components/       # 公共组件和布局系统
│   ├── router/           # 路由模块
│   ├── stores/           # Pinia 状态
│   └── views/            # 页面和模板示例
├── src-tauri/            # Tauri 2 / Rust 工程
├── uno.config.ts         # UnoCSS 配置
└── vite.config.ts        # Vite 配置
```

## 内置页面

- `/`：模板选择页。
- `/template/topnav`：顶部导航模板。
- `/template/sidebar`：侧边栏布局模板。
- `/template/hybrid`：混合布局模板。
- `/template/blank`：空白布局模板。
- `/template/workspace`：智能工作台自定义模板。
- `/settings`：设置页，包含主题布局、桌面与文件、系统信息。
- `/examples/layout`：布局系统演示入口。

## Mock API

Mock 文件位于 `mock/`。开发时设置：

```env
VITE_MOCK_DEV_SERVER=true
```

即可启用本地 Mock 服务。模板内置示例包括：

- `mock/template/status.ts`
- `mock/template/echo.ts`
- `mock/template/upload.ts`
- `mock/template/auth/login.ts`
- `mock/template/auth/logout.ts`
- `mock/template/auth/register.ts`

## 文档入口

| 文档 | 说明 |
| --- | --- |
| `docs/README.md` | 文档索引。 |
| `docs/模块化编码规则.md` | 项目模块化编码规则。 |
| `docs/tauri/dev.md` | Tauri 开发说明。 |
| `docs/tauri/cli/` | Tauri CLI 命令说明。 |
| `docs/tauri/guide/structure.md` | Tauri Rust 分层、命令注册和模块边界说明。 |
| `docs/tauri/guide/配置文件指南.md` | Tauri 配置文件、平台字段和 `--config` 边界。 |
| `docs/tauri/guide/签名与更新签名指南.md` | 桌面、移动端、OpenHarmony 和 updater 签名边界。 |
| `docs/tauri/guide/Tauri依赖更新指南.md` | Tauri npm 包、Cargo crate 和 OpenHarmony 分支依赖更新流程。 |
| `docs/tauri/guide/` | macOS、Windows、Linux、Android、iOS、OpenHarmony 等平台接入指南。 |
| `src/components/layouts/README.md` | 布局系统使用文档。 |
| `src/components/layouts/docs/布局系统设计说明.md` | 布局系统设计和维护边界。 |

## License

MIT
