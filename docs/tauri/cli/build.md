# tauri build

`tauri build` 以 release 模式构建应用，并生成 bundles 和 installers。命令会读取 `tauri.conf.json` 中的 `build.frontendDist` 作为前端产物目录；也会执行 `build.beforeBuildCommand`，通常用于把前端构建到 `build.frontendDist`。如果配置了 `build.beforeBundleCommand`，会在生成 bundles/installers 之前执行该命令。

## 基本命令

```bash
pnpm tauri build
```

## 用法

```bash
pnpm tauri build [OPTIONS] [ARGS]...
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[ARGS]...` | 传给底层 runner 的命令行参数。需要用 `--` 显式标记 Tauri CLI 参数结束和 runner 参数开始，例如 `pnpm tauri build -t aarch64-apple-darwin -- --locked`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-r, --runner <RUNNER>` | 指定用于构建应用的底层二进制程序，默认是 `cargo`。只有需要替换 Cargo runner、接入自定义 wrapper 或排查 runner 行为时使用。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-d, --debug` | 使用 debug flag 构建。适合排查 Rust/native 问题；不要用 debug 产物评估 release 体积、性能或最终签名行为。 |
| `-t, --target <TARGET>` | 指定构建目标 triple。它必须是 `$ rustc --print target-list` 输出的值，或 macOS universal 应用专用的 `universal-apple-darwin`。构建 universal macOS 应用时，必须同时安装 `aarch64-apple-darwin` 和 `x86_64-apple-darwin` 两个 Rust target。 |
| `-f, --features <FEATURES>` | 激活 Cargo features。支持空格或逗号分隔，例如 `-f feature-a feature-b` 或 `-f feature-a,feature-b`。只有 Rust crate 定义了对应 features 时才有意义。 |
| `-b, --bundles <BUNDLES>` | 指定要打包的 bundle 类型，支持空格或逗号分隔。本机 help 当前列出的可选值是 `ios`、`app`、`dmg`；其他系统上的可用值以对应平台执行 `pnpm tauri build -h` 的输出为准。 |
| `--no-bundle` | 跳过 bundling 步骤，即使 `tauri.conf.json` 中 `bundle.active` 是 `true` 也不会生成 installers/bundles。适合只验证 native 编译是否通过。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.macos.conf.json`、`tauri.linux.conf.json`、`tauri.windows.conf.json`、`tauri.android.conf.json`、`tauri.ios.conf.json`。 |
| `--ci` | 跳过交互提示，适合 CI 或无人值守构建；也可通过环境变量 `CI` 启用。 |
| `--skip-stapling` | macOS notarization 后不等待完成并 `staple` ticket 到 app。Gatekeeper 会使用 stapled ticket 在离线环境判断应用是否已公证。该参数也会让 `tauri build` 不等待 notarization 完成，适合首次公证耗时很长时使用；后续常规发布通常应关闭。 |
| `--ignore-version-mismatches` | 版本不一致时不报错。只有确认 Tauri 包版本检查是误报时才使用；真实版本不一致可能导致未知行为。 |
| `--no-sign` | bundling 时跳过代码签名。适合本地验证或无签名环境；正式发布不要默认使用。 |
| `-h, --help` | 查看 `tauri build` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[ARGS]...` | 给底层 Cargo 传参，使用 `--` 分隔 Tauri 参数和 runner 参数 | `pnpm tauri build -t aarch64-apple-darwin -- --locked` |
| `-r, --runner <RUNNER>` | 指定底层 runner 为 `cargo` | `pnpm tauri build -r cargo -t aarch64-apple-darwin --ci` |
| `-v, --verbose` | 构建时输出详细日志 | `pnpm tauri build -v -t aarch64-apple-darwin --no-bundle --ci` |
| `-d, --debug` | 使用 debug flag 构建，用于排查 Rust/native 问题 | `pnpm tauri build -d -t aarch64-apple-darwin --no-bundle` |
| `-t, --target <TARGET>` | 构建 macOS universal 应用 | `pnpm tauri build -t universal-apple-darwin -b app dmg --ci` |
| `-f, --features <FEATURES>` | 激活 Cargo features | `pnpm tauri build -f feature-a,feature-b -t aarch64-apple-darwin --ci` |
| `-b, --bundles <BUNDLES>` | 同时生成 app 和 dmg bundle | `pnpm tauri build -t universal-apple-darwin -b app dmg --ci` |
| `--no-bundle` | 只验证 native release 编译，不生成 bundle/installer | `pnpm tauri build -t aarch64-apple-darwin --no-bundle --ci` |
| `-c, --config <CONFIG>` | 使用额外 Tauri 配置文件覆盖默认配置 | `pnpm tauri build -c tauri.local.conf.json -t aarch64-apple-darwin --ci` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时跳过前端构建命令 | `pnpm tauri build -c '{"build":{"beforeBuildCommand":"true"}}' -t aarch64-apple-darwin --no-bundle --ci` |
| `--ci` | CI 环境无人值守构建 | `pnpm tauri build -t aarch64-apple-darwin --no-bundle --ci` |
| `--skip-stapling` | macOS 公证流程中不等待 stapling | `pnpm tauri build -t universal-apple-darwin -b dmg --skip-stapling --ci` |
| `--ignore-version-mismatches` | 仅在确认版本检查误报时继续构建 | `pnpm tauri build -t aarch64-apple-darwin --ignore-version-mismatches --ci` |
| `--no-sign` | 无签名环境下验证 bundle 流程 | `pnpm tauri build -t aarch64-apple-darwin -b dmg --no-sign --ci` |
| `-h, --help` | 查看 build 帮助 | `pnpm tauri build -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri build -V` |

## 本项目注意事项

- `src-tauri/tauri.conf.json` 当前配置 `beforeBuildCommand: "pnpm build"`，执行 `pnpm tauri build` 会先做前端类型检查和 Vite 构建。
- `src-tauri/tauri.conf.json` 当前配置 `frontendDist: "../dist"`，对应根目录 Vite 输出目录。
- bundle/installer 类型和签名能力受执行平台影响；跨平台构建必须在对应系统或完整交叉编译环境里验证。
- 修改构建相关配置时，同时检查 `src-tauri/tauri.conf.json`、`vite.config.ts` 和对应平台配置文件。
