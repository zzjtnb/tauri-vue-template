# tauri bundle

`tauri bundle` 用于在应用已经由 `tauri build` 构建后生成 bundles 和 installers。命令会在生成 bundles/installers 前执行 `build.beforeBundleCommand`，但它不等同于完整的 `tauri build`，不会替代前面的应用构建步骤。

## 基本命令

```bash
pnpm tauri bundle
```

## 用法

```bash
pnpm tauri bundle [OPTIONS]
```

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-d, --debug` | 使用 debug flag 的上下文生成 bundle。必须和实际已构建产物的模式匹配；不要用 debug bundle 评估 release 体积、性能或最终签名行为。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-b, --bundles [<BUNDLES>...]` | 指定要打包的 bundle 类型，支持空格或逗号分隔。本机 help 当前列出的可选值是 `ios`、`app`、`dmg`；其他系统上的可用值以对应平台执行 `pnpm tauri bundle -h` 的输出为准。 |
| `-c, --config <CONFIG>` | 叠加 Tauri 配置。可以传 JSON 字符串，也可以传 JSON、JSON5 或 TOML 文件路径。多个 config 会按传入顺序合并，后面的 key 覆盖前面的 key。Tauri 默认也会查找并合并平台配置文件，例如 `tauri.macos.conf.json`、`tauri.linux.conf.json`、`tauri.windows.conf.json`、`tauri.android.conf.json`、`tauri.ios.conf.json`。 |
| `-f, --features [<FEATURES>...]` | 激活 Cargo features，支持空格或逗号分隔。如果 `tauri build` 阶段使用了 features，这里应传入相同 features，避免 bundle 阶段上下文与已构建产物不一致。 |
| `-t, --target <TARGET>` | 指定构建目标 triple。它必须是 `$rustc --print target-list` 输出的值，或 macOS universal 应用专用的 `universal-apple-darwin`。构建 universal macOS 应用时，必须同时安装 `aarch64-apple-darwin` 和 `x86_64-apple-darwin` 两个 Rust target。 |
| `--ci` | 跳过交互提示，适合 CI 或无人值守 bundle；也可通过环境变量 `CI` 启用。 |
| `--skip-stapling` | macOS notarization 后不等待完成并 `staple` ticket 到 app。Gatekeeper 会使用 stapled ticket 在离线环境判断应用是否已公证。该参数也会让 `tauri build` 不等待 notarization 完成，适合首次公证耗时很长时使用；后续常规发布通常应关闭。 |
| `--no-sign` | bundling 时跳过代码签名。适合本地开发或缺少签名证书、签名环境变量的 CI 环境；正式发布不要默认使用。 |
| `-h, --help` | 查看 `tauri bundle` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `-d, --debug` | 为 debug 产物生成 app bundle | `pnpm tauri bundle -d -t aarch64-apple-darwin -b app` |
| `-v, --verbose...` | 生成 bundle 时输出详细日志 | `pnpm tauri bundle -v -t aarch64-apple-darwin -b dmg --ci` |
| `-b, --bundles [<BUNDLES>...]` | 同时生成 app 和 dmg bundle | `pnpm tauri bundle -t universal-apple-darwin -b app dmg --ci` |
| `-b, --bundles [<BUNDLES>...]` | 使用逗号分隔 bundle 类型 | `pnpm tauri bundle -t universal-apple-darwin -b app,dmg --ci` |
| `-c, --config <CONFIG>` | 使用额外 Tauri 配置文件覆盖默认配置 | `pnpm tauri bundle -c tauri.local.conf.json -t aarch64-apple-darwin -b dmg --ci` |
| `-c, --config <CONFIG>` | 使用 JSON 字符串临时覆盖 bundle 配置 | `pnpm tauri bundle -c '{"bundle":{"active":true}}' -t aarch64-apple-darwin -b dmg --ci` |
| `-f, --features [<FEATURES>...]` | 与 build 阶段保持 Cargo features 一致 | `pnpm tauri bundle -f feature-a,feature-b -t aarch64-apple-darwin -b dmg --ci` |
| `-t, --target <TARGET>` | 为 macOS universal 产物生成 bundle | `pnpm tauri bundle -t universal-apple-darwin -b app dmg --ci` |
| `--ci` | CI 环境无人值守生成 bundle | `pnpm tauri bundle -t aarch64-apple-darwin -b dmg --ci` |
| `--skip-stapling` | macOS 公证流程中不等待 stapling | `pnpm tauri bundle -t universal-apple-darwin -b dmg --skip-stapling --ci` |
| `--no-sign` | 无签名环境下验证 bundle 流程 | `pnpm tauri bundle -t aarch64-apple-darwin -b dmg --no-sign --ci` |
| `-h, --help` | 查看 bundle 帮助 | `pnpm tauri bundle -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri bundle -V` |

## 本项目注意事项

- 如果还没执行过对应 target 的构建，优先使用 `pnpm tauri build`。
- `bundle` 适合“应用本体已构建，只重新生成安装包”的场景。
- bundle/installer 类型、签名和公证能力受执行平台影响；跨平台分发必须在对应系统或完整交叉编译环境里验证。
