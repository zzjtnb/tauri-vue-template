# tauri dev

`tauri dev` 用于以开发模式运行应用，并为 Rust 代码启用热重载。命令会读取 `tauri.conf.json` 的 `build.devUrl`，也会执行 `build.beforeDevCommand`；该命令通常用于启动前端 dev server。

## 基本命令

```bash
pnpm tauri dev
```

## 用法

```bash
pnpm tauri dev [OPTIONS] [ARGS]...
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[ARGS]...` | 传给底层 runner 的命令行参数。需要用 `--` 显式标记参数开始；第二个 `--` 之后的参数会传给应用，例如 `pnpm tauri dev -- [runnerArgs] -- [appArgs]`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-r, --runner <RUNNER>` | 指定用于运行应用的底层二进制程序。通常保持默认即可，只有需要替换 runner、接入自定义 wrapper 或排查 runner 行为时使用。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-t, --target <TARGET>` | 指定构建目标 triple。用于调试特定 Rust target；目标值应与本机已安装 target 和平台能力匹配。 |
| `-f, --features <FEATURES>` | 激活 Cargo features。支持空格或逗号分隔，例如 `-f feature-a feature-b` 或 `-f feature-a,feature-b`。只有 Rust crate 定义了对应 features 时才有意义。 |
| `-e, --exit-on-panic` | Rust 侧 panic 时退出应用。适合排查 native 崩溃，避免 panic 后应用继续停留在不可靠状态。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.macos.conf.json`、`tauri.linux.conf.json`、`tauri.windows.conf.json`、`tauri.android.conf.json`、`tauri.ios.conf.json`。 |
| `--release` | 以 release 模式运行开发流程。适合贴近 release 优化、权限、条件编译或性能行为排查；不要把它当作普通开发默认模式。 |
| `--no-dev-server-wait` | 不等待前端 dev server 启动就继续构建 Tauri 应用；也可通过环境变量 `TAURI_CLI_NO_DEV_SERVER_WAIT` 启用。只有确认前端服务已由其他方式就绪或不需要等待时使用。 |
| `--no-watch` | 禁用文件监听。适合排查 watcher、文件系统事件或热重载相关问题。 |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 增加额外监听路径。适合本地依赖、共享包或 Tauri/Rust 目录之外的文件变化也需要触发重载的场景。 |
| `--no-dev-server` | 禁用内置静态文件 dev server。只有确认应用开发模式不需要 Tauri 内置静态服务时使用。 |
| `--port <PORT>` | 指定内置静态文件 dev server 的端口，默认值是 `1430`；也可通过环境变量 `TAURI_CLI_PORT` 设置。注意它不是前端 Vite dev server 的端口。 |
| `-h, --help` | 查看 `tauri dev` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[ARGS]...` | 给底层 runner 传参，使用 `--` 分隔 Tauri 参数和 runner 参数 | `pnpm tauri dev -- --locked` |
| `[ARGS]...` | 同时给 runner 和应用传参，第二个 `--` 后为应用参数 | `pnpm tauri dev -- --locked -- --app-arg=value` |
| `-r, --runner <RUNNER>` | 指定底层 runner 为 `cargo` | `pnpm tauri dev -r cargo` |
| `-v, --verbose` | 开发模式输出详细日志 | `pnpm tauri dev -v` |
| `-t, --target <TARGET>` | 指定 Rust target 调试 | `pnpm tauri dev -t aarch64-apple-darwin` |
| `-f, --features <FEATURES>` | 激活 Cargo features | `pnpm tauri dev -f feature-a,feature-b` |
| `-e, --exit-on-panic` | Rust panic 时直接退出应用 | `pnpm tauri dev -e` |
| `-c, --config <CONFIG>` | 使用额外 Tauri 配置文件覆盖默认配置 | `pnpm tauri dev -c tauri.local.conf.json` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时修改 devUrl | `pnpm tauri dev -c '{"build":{"devUrl":"http://localhost:3000"}}'` |
| `--release` | 以 release 模式运行开发流程 | `pnpm tauri dev --release` |
| `--no-dev-server-wait` | 不等待前端 dev server 就继续 Tauri 构建 | `pnpm tauri dev --no-dev-server-wait` |
| `--no-watch` | 禁用文件监听 | `pnpm tauri dev --no-watch` |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 监听额外本地共享目录 | `pnpm tauri dev --additional-watch-folders ../shared` |
| `--no-dev-server` | 禁用 Tauri 内置静态文件 dev server | `pnpm tauri dev --no-dev-server` |
| `--port <PORT>` | 指定 Tauri 内置静态文件 dev server 端口 | `pnpm tauri dev --port 1431` |
| `-h, --help` | 查看 dev 帮助 | `pnpm tauri dev -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri dev -V` |

## 本项目注意事项

- `src-tauri/tauri.conf.json` 当前配置 `beforeDevCommand: "pnpm dev"`，执行 `pnpm tauri dev` 会由 Tauri 启动前端 dev server。
- 本项目 Vite 固定端口是 `3000`，不要只改一边端口。
- `--port` 控制 Tauri 内置静态文件 dev server 端口，不等同于 `build.devUrl` 指向的 Vite 端口。
- `pnpm tauri dev` 会启动长运行开发进程；文档示例用于说明参数，不应在无人确认时实际执行。
