# tauri init

`tauri init` 用于在已有目录中初始化 Tauri 项目。它会创建或更新 `src-tauri` 相关工程文件。本项目保留 `tauri:init` 作为显式初始化入口，但当前项目已经存在 `src-tauri/`，不要随意使用覆盖模式。

## 基本命令

```bash
pnpm tauri init
```

## 用法

```bash
pnpm tauri init [OPTIONS]
```

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `--ci` | 跳过交互式取值提示，适合脚手架、CI 或无人值守初始化；也可通过环境变量 `CI` 启用。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-f, --force` | 强制初始化并覆盖已有 `src-tauri` 文件夹。会影响现有 Tauri 工程，执行前必须确认已有配置、Rust 代码、capabilities、icons 等内容可以被覆盖或已备份。 |
| `-l, --log` | 初始化时启用 logging 配置。适合新工程希望默认接入日志能力的场景。 |
| `-d, --directory <DIRECTORY>` | 设置 init 的目标目录。默认值是当前执行目录；本项目 help 输出会显示实际执行时的当前项目目录，例如 `<当前项目目录>`。 |
| `-t, --tauri-path <TAURI_PATH>` | 指定要使用的 Tauri 项目路径，相对当前工作目录。通常用于非默认 `src-tauri` 目录结构。 |
| `-A, --app-name <APP_NAME>` | 设置 Tauri 应用名称。该值会进入生成的项目配置，并影响应用显示名等初始化结果。 |
| `-W, --window-title <WINDOW_TITLE>` | 设置 Tauri 应用默认窗口标题。 |
| `-D, --frontend-dist <FRONTEND_DIST>` | 设置 Web assets 位置，即前端构建产物目录；路径相对 `<project-dir>/src-tauri`。本项目当前构建产物是根目录 `dist`，对应 `../dist`。 |
| `-P, --dev-url <DEV_URL>` | 设置开发服务器 URL。必须和前端开发服务器实际地址保持一致；本项目 Vite 端口是 `3000`，对应 `http://localhost:3000`。 |
| `--before-dev-command <BEFORE_DEV_COMMAND>` | 设置 `tauri dev` 开始前运行的 shell 命令，通常用于启动前端 dev server，例如 `pnpm dev`。 |
| `--before-build-command <BEFORE_BUILD_COMMAND>` | 设置 `tauri build` 开始前运行的 shell 命令，通常用于构建前端产物，例如 `pnpm build`。 |
| `-h, --help` | 查看 `tauri init` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `--ci` | CI 中初始化并跳过提示 | `pnpm tauri init --ci` |
| `-v, --verbose` | 初始化时输出详细日志 | `pnpm tauri init -v --ci` |
| `-f, --force` | 确认可覆盖后强制重建 `src-tauri` | `pnpm tauri init -f --ci` |
| `-l, --log` | 初始化时启用 logging 配置 | `pnpm tauri init -l --ci` |
| `-d, --directory <DIRECTORY>` | 在指定项目目录初始化 | `pnpm tauri init -d /path/to/project --ci` |
| `-t, --tauri-path <TAURI_PATH>` | 使用非默认 Tauri 工程目录 | `pnpm tauri init -t src-tauri --ci` |
| `-A, --app-name <APP_NAME>` | 设置应用名称 | `pnpm tauri init -A 争逐 --ci` |
| `-W, --window-title <WINDOW_TITLE>` | 设置默认窗口标题 | `pnpm tauri init -W 争逐 --ci` |
| `-D, --frontend-dist <FRONTEND_DIST>` | 设置前端构建产物目录 | `pnpm tauri init -D ../dist --ci` |
| `-P, --dev-url <DEV_URL>` | 设置开发服务器地址 | `pnpm tauri init -P http://localhost:3000 --ci` |
| `--before-dev-command <BEFORE_DEV_COMMAND>` | 设置 `tauri dev` 前启动前端开发服务 | `pnpm tauri init --before-dev-command "pnpm dev" --ci` |
| `--before-build-command <BEFORE_BUILD_COMMAND>` | 设置 `tauri build` 前构建前端产物 | `pnpm tauri init --before-build-command "pnpm build" --ci` |
| `-h, --help` | 查看 init 帮助 | `pnpm tauri init -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri init -V` |

## 本项目注意事项

- 当前项目已经存在 `src-tauri/`，不要随意执行 `pnpm tauri init -f`。
- `devUrl` 必须和 `vite.config.ts` 的端口保持一致；当前是 `http://localhost:3000`。
- `frontendDist` 当前是 `../dist`，对应根目录 Vite 构建产物。
- `beforeDevCommand` 当前是 `pnpm dev`，`beforeBuildCommand` 当前是 `pnpm build`；初始化新工程时要根据项目脚本实际名称填写。
