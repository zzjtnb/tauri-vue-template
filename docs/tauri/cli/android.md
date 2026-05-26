# tauri android

`tauri android` 是官方 Android 命令组，用于初始化、开发、构建和运行 Android 目标。本项目在 `package.json` 中提供 `android:*` 常用脚本；低频参数仍通过 `pnpm tauri android ...` 直接透传官方 CLI。

## 用法

```bash
pnpm tauri android [OPTIONS] <COMMAND>
```

## 命令组

| 命令 | 完整说明 |
| --- | --- |
| `init` | 在项目中初始化 Android target。 |
| `dev` | 在 Android 上以开发模式运行应用。 |
| `build` | 以 release 模式构建 Android 应用，并生成 APK 和 AAB。 |
| `run` | 在 Android 上以生产模式运行应用。 |
| `help` | 输出本命令或指定子命令的帮助。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri android` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节覆盖 `tauri android` 顶层命令的每个子命令和每个选项。子命令自己的参数覆盖见对应小节。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `init` | 初始化 Android target | `pnpm tauri android init` |
| `dev` | 查看 Android 开发模式帮助，避免实际启动 dev | `pnpm tauri android dev -h` |
| `build` | 查看 Android 构建帮助，避免实际构建 | `pnpm tauri android build -h` |
| `run` | 查看 Android 生产运行帮助，避免实际运行 | `pnpm tauri android run -h` |
| `help` | 查看顶层帮助 | `pnpm tauri android help` |
| `-v, --verbose...` | 输出顶层详细日志 | `pnpm tauri android -v -h` |
| `-h, --help` | 查看顶层帮助 | `pnpm tauri android -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri android -V` |

## android init

`android init` 用于在项目中初始化 Android target，是一次性命令，不应写入 `package.json` scripts。

### 基本命令

```bash
pnpm tauri android init
```

### 用法

```bash
pnpm tauri android init [OPTIONS]
```

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `--ci` | 跳过交互提示，适合 CI 或无人值守初始化；也可通过环境变量 `CI` 启用。 |
| `-v, --verbose...` | 启用更详细的初始化日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `--skip-targets-install` | 跳过通过 `rustup` 安装 Android Rust toolchains/targets。只有确认 targets 已安装或由外部环境管理时使用。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.macos.conf.json`、`tauri.linux.conf.json`、`tauri.windows.conf.json`、`tauri.android.conf.json`、`tauri.ios.conf.json`；该选项适合更细的构建 flavor。 |
| `-h, --help` | 查看 `tauri android init` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `--ci` | CI 中初始化 Android target | `pnpm tauri android init --ci` |
| `-v, --verbose...` | 初始化时输出详细日志 | `pnpm tauri android init -v --ci` |
| `--skip-targets-install` | 已预装 Rust targets，跳过自动安装 | `pnpm tauri android init --skip-targets-install --ci` |
| `-c, --config <CONFIG>` | 使用 Android 专用配置初始化 | `pnpm tauri android init -c tauri.android.local.json --ci` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时覆盖配置 | `pnpm tauri android init -c '{"identifier":"com.zzjtnb.zzjt"}' --ci` |
| `-h, --help` | 查看 init 帮助 | `pnpm tauri android init -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri android init -V` |

## android dev

`android dev` 用于在 Android 上以开发模式运行应用，并支持 Rust 代码热重载。它会读取 `tauri.conf.json` 中的 `build.devUrl`，也会执行 `build.beforeDevCommand`，通常用于启动前端 dev server。

### 基本命令

```bash
pnpm tauri android dev
```

### 用法

```bash
pnpm tauri android dev [OPTIONS] [DEVICE] [-- <ARGS>...]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[DEVICE]` | 指定要运行的 Android 设备名称。不传则由 CLI 选择或提示。 |
| `[ARGS]...` | 传给底层 runner 的命令行参数。需要用 `--` 显式标记 Tauri CLI 参数结束和 runner 参数开始，例如 `pnpm tauri android dev -- --stacktrace`。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-f, --features [<FEATURES>...]` | 激活 Cargo features。支持传入一个或多个 feature；通常可用空格或逗号分隔，例如 `-f feature-a feature-b` 或 `-f feature-a,feature-b`。只有 Rust crate 定义了对应 features 时才有意义。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-e, --exit-on-panic` | Rust 侧 panic 时退出应用，适合排查 native 崩溃。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.android.conf.json`。 |
| `--release` | 以 release 模式运行开发流程，用于贴近 release 行为排查问题；不要用它替代正式构建验收。 |
| `--no-dev-server-wait` | 不等待前端 dev server 启动就继续构建 Tauri 应用；也可通过环境变量 `TAURI_CLI_NO_DEV_SERVER_WAIT` 启用。只有确认前端服务由外部流程管理时使用。 |
| `--no-watch` | 禁用文件监听。适合排查 watcher 或文件系统相关问题；禁用后不要期待自动重载。 |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 额外监听目录，用于本地依赖目录需要触发重载的场景。 |
| `-o, --open` | 打开 Android Studio，而不是尝试运行到连接的设备。 |
| `--force-ip-prompt` | 强制提示选择用于移动端连接 dev server 的 IP。 |
| `--host [<HOST>]` | 使用公网/局域网地址作为开发服务器 host；如果传具体地址则直接使用，否则提示选择。Windows 默认使用公共网络地址。该选项常与 `--open` 配合用于真机调试，会把 `devUrl` 配置值替换成公共网络地址 host；必须自行确保前端 dev server 监听该地址，例如使用 `0.0.0.0`。设置该选项或运行到 iOS 设备时，CLI 会设置 `TAURI_DEV_HOST` 环境变量，框架配置可据此暴露到公共网络地址。默认值为 `<none>`。 |
| `--no-dev-server` | 禁用 Tauri 内置的静态文件 dev server。 |
| `--port <PORT>` | 指定 Tauri 内置静态文件 dev server 端口，默认 `1430`；也可通过环境变量 `TAURI_CLI_PORT` 设置。 |
| `--root-certificate-path <ROOT_CERTIFICATE_PATH>` | 指定 dev server 使用的证书文件路径。移动端 HTTPS 开发时必需；也可通过环境变量 `TAURI_DEV_ROOT_CERTIFICATE_PATH` 设置。 |
| `-h, --help` | 查看 `tauri android dev` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[DEVICE]` | 指定设备运行 | `pnpm tauri android dev Pixel_8` |
| `[ARGS]...` | 给底层 Android runner 传参 | `pnpm tauri android dev -- --stacktrace` |
| `-f, --features [<FEATURES>...]` | 启用 Cargo features | `pnpm tauri android dev -f feature-a,feature-b` |
| `-v, --verbose...` | 输出详细日志 | `pnpm tauri android dev -v` |
| `-e, --exit-on-panic` | Rust panic 时退出 | `pnpm tauri android dev -e` |
| `-c, --config <CONFIG>` | 使用额外配置文件 | `pnpm tauri android dev -c tauri.android.local.json` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时覆盖 devUrl | `pnpm tauri android dev -c '{"build":{"devUrl":"http://<电脑局域网 IP>:3000"}}'` |
| `--release` | 以 release 模式运行开发流程 | `pnpm tauri android dev --release` |
| `--no-dev-server-wait` | 不等待 dev server | `pnpm tauri android dev --no-dev-server-wait` |
| `--no-watch` | 禁用 watcher | `pnpm tauri android dev --no-watch` |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 增加额外监听目录 | `pnpm tauri android dev --additional-watch-folders ../shared` |
| `-o, --open` | 打开 Android Studio | `pnpm tauri android dev -o` |
| `--force-ip-prompt` | 强制提示选择 IP | `pnpm tauri android dev --force-ip-prompt` |
| `--host [<HOST>]` | 自动提示公共网络地址 | `pnpm tauri android dev --host` |
| `--host [<HOST>]` | 真机调试并指定局域网 host | `pnpm tauri android dev --host <电脑局域网 IP>` |
| `--no-dev-server` | 禁用内置静态 dev server | `pnpm tauri android dev --no-dev-server` |
| `--port <PORT>` | 指定内置静态 dev server 端口 | `pnpm tauri android dev --port 1431` |
| `--root-certificate-path <ROOT_CERTIFICATE_PATH>` | HTTPS dev server 指定根证书 | `pnpm tauri android dev --root-certificate-path ./certs/root.pem` |
| `-h, --help` | 查看 dev 帮助 | `pnpm tauri android dev -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri android dev -V` |

## android build

`android build` 用于以 release 模式构建 Android 应用，并生成 APK 和 AAB。它会读取 `tauri.conf.json` 中的 `build.frontendDist` 作为前端产物目录，也会执行 `build.beforeBuildCommand`，通常用于把前端构建到 `build.frontendDist`。

### 基本命令

```bash
pnpm tauri android build
```

### 用法

```bash
pnpm tauri android build [OPTIONS] [-- <ARGS>...]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[ARGS]...` | 传给底层 runner 的命令行参数。需要用 `--` 显式标记 Tauri CLI 参数结束和 runner 参数开始，例如 `pnpm tauri android build -- --stacktrace`。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-d, --debug` | 使用 debug flag 构建。适合调试 native 或 Android 工程问题；不要用 debug 产物评估 release 体积、性能或最终签名行为。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-t, --target [<TARGETS>...]` | 指定要构建的 Android ABI；默认构建全部支持目标。可传一个或多个 target。可选值：`aarch64`、`armv7`、`i686`、`x86_64`。 |
| `-f, --features [<FEATURES>...]` | 激活 Cargo features。支持传入一个或多个 feature；通常可用空格或逗号分隔，例如 `-f feature-a feature-b` 或 `-f feature-a,feature-b`。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.android.conf.json`。 |
| `--split-per-abi` | 按 ABI 拆分 APK 和 AAB，适合需要分别分发不同架构产物的场景。 |
| `--apk` | 生成 APK，用于本地安装、测试或不走应用商店的分发。 |
| `--aab` | 生成 AAB，通常用于 Google Play 等应用商店上传。 |
| `-o, --open` | 构建后打开 Android Studio。 |
| `--ci` | 跳过交互提示，适合 CI 或无人值守构建；也可通过环境变量 `CI` 启用。 |
| `--ignore-version-mismatches` | 版本不一致时不报错。只有确认 Tauri 包版本检查是误报时才使用；真实版本不一致可能导致未知行为。 |
| `-h, --help` | 查看 `tauri android build` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[ARGS]...` | 给底层 Android runner 传 Gradle 参数 | `pnpm tauri android build --apk -t aarch64 -- --stacktrace` |
| `-d, --debug` | debug 构建并输出详细日志 | `pnpm tauri android build -d --apk -t aarch64 -v` |
| `-v, --verbose...` | 构建时输出详细日志 | `pnpm tauri android build --apk -t aarch64 -v --ci` |
| `-t, --target [<TARGETS>...]` | 构建多个 ABI | `pnpm tauri android build --apk -t aarch64 armv7 --ci` |
| `-f, --features [<FEATURES>...]` | 传递 Cargo features | `pnpm tauri android build --apk -t aarch64 -f feature-a,feature-b --ci` |
| `-c, --config <CONFIG>` | 使用额外 Tauri 配置文件 | `pnpm tauri android build --apk -t aarch64 -c tauri.android.local.json --ci` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时跳过前端构建命令 | `pnpm tauri android build --apk -t aarch64 -c '{"build":{"beforeBuildCommand":"true"}}' --ci` |
| `--split-per-abi` | 按 ABI 拆分产物 | `pnpm tauri android build --apk --aab -t aarch64 armv7 --split-per-abi --ci` |
| `--apk` | 生成 aarch64 APK | `pnpm tauri android build --apk -t aarch64 --ci` |
| `--aab` | 生成 aarch64 AAB，用于商店上传链路 | `pnpm tauri android build --aab -t aarch64 --ci` |
| `-o, --open` | 构建后打开 Android Studio | `pnpm tauri android build --apk -t aarch64 -o` |
| `--ci` | CI 环境无人值守构建 | `pnpm tauri android build --apk -t aarch64 --ci` |
| `--ignore-version-mismatches` | 仅在确认版本检查误报时继续构建 | `pnpm tauri android build --apk -t aarch64 --ignore-version-mismatches --ci` |
| `-h, --help` | 查看 build 帮助 | `pnpm tauri android build -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri android build -V` |

## android run

`android run` 用于在 Android 上以生产模式运行应用。它会读取 `tauri.conf.json` 中的 `build.frontendDist`，也会执行 `build.beforeBuildCommand`，通常用于把前端构建到 `build.frontendDist`。

### 基本命令

```bash
pnpm tauri android run
```

### 用法

```bash
pnpm tauri android run [OPTIONS] [DEVICE] [-- <ARGS>...]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[DEVICE]` | 指定要运行的 Android 设备名称。不传则由 CLI 选择或提示。 |
| `[ARGS]...` | 传给底层 runner 的命令行参数。需要用 `--` 显式标记 Tauri CLI 参数结束和 runner 参数开始；当前 help 示例为 `tauri android build -- [runnerArgs]`。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-r, --release` | 以 release 模式运行应用。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-f, --features [<FEATURES>...]` | 激活 Cargo features。支持传入一个或多个 feature；通常可用空格或逗号分隔。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.android.conf.json`。 |
| `--no-watch` | 禁用文件监听。适合排查 watcher 或文件系统相关问题；禁用后不要期待自动重载。 |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 额外监听目录，用于本地依赖目录需要触发重载的场景。 |
| `-o, --open` | 打开 Android Studio。 |
| `--ignore-version-mismatches` | 版本不一致时不报错。只有确认 Tauri 包版本检查是误报时才使用；真实版本不一致可能导致未知行为。 |
| `-h, --help` | 查看 `tauri android run` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[DEVICE]` | 指定设备运行 | `pnpm tauri android run Pixel_8` |
| `[ARGS]...` | 给底层 runner 传参 | `pnpm tauri android run -- --stacktrace` |
| `-r, --release` | release 模式运行 | `pnpm tauri android run -r` |
| `-v, --verbose...` | 输出详细日志 | `pnpm tauri android run -v` |
| `-f, --features [<FEATURES>...]` | 启用 Cargo features | `pnpm tauri android run -f feature-a,feature-b` |
| `-c, --config <CONFIG>` | 使用额外配置文件 | `pnpm tauri android run -c tauri.android.local.json` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时跳过前端构建命令 | `pnpm tauri android run -c '{"build":{"beforeBuildCommand":"true"}}'` |
| `--no-watch` | 禁用 watcher | `pnpm tauri android run --no-watch` |
| `--additional-watch-folders <ADDITIONAL_WATCH_FOLDERS>` | 增加额外监听目录 | `pnpm tauri android run --additional-watch-folders ../shared` |
| `-o, --open` | 打开 Android Studio | `pnpm tauri android run -o` |
| `--ignore-version-mismatches` | 仅在确认版本检查误报时继续运行 | `pnpm tauri android run --ignore-version-mismatches` |
| `-h, --help` | 查看 run 帮助 | `pnpm tauri android run -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri android run -V` |

## Android target 可选值

```text
aarch64
armv7
i686
x86_64
```

## 本项目注意事项

- Android 官方链路使用 `src-tauri/` 根工程。
- `src-tauri/tauri.conf.json` 的 `build.devUrl`、`build.frontendDist`、`build.beforeDevCommand`、`build.beforeBuildCommand` 会直接影响 `android dev`、`android build` 和 `android run`。
- 真机 dev 需要确保前端 dev server 能被设备访问；必要时使用 `--host`，并让 Vite 监听对应 host，例如 `0.0.0.0`。
