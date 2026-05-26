# tauri info

`tauri info` 用于输出当前环境、Rust、Node.js 及其版本，以及若干相关项目配置的简明信息。排查构建、移动端工具链、Tauri 版本或项目配置问题时优先使用。

## 基本命令

```bash
pnpm tauri info
```

## 用法

```bash
pnpm tauri info [OPTIONS]
```

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `--interactive` | 进入交互模式，以便应用自动修复。该模式可能触发修复动作；如果只想收集环境信息，不要使用该参数。 |
| `-v, --verbose` | 启用更详细的环境、版本和配置日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri info` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `--interactive` | 交互式检查并尝试自动修复 | `pnpm tauri info --interactive` |
| `-v, --verbose` | 输出详细环境和配置日志 | `pnpm tauri info -v` |
| `-h, --help` | 查看 info 帮助 | `pnpm tauri info -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri info -V` |

## 本项目注意事项

- 排查 Tauri CLI、Rust target、Android/iOS 工具链或版本不一致时，先运行 `pnpm tauri info`。
- `--interactive` 可能触发自动修复动作；如果只想收集信息，使用不带该参数的命令。
