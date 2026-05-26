# tauri inspect

`tauri inspect` 用于检查 Tauri 内部使用的派生值。当前子命令主要用于查看 Windows MSI installer 相关的默认 Upgrade Code。

## 基本命令

```bash
pnpm tauri inspect -h
pnpm tauri inspect wix-upgrade-code
```

## 用法

```bash
pnpm tauri inspect [OPTIONS] <COMMAND>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的 inspect 子命令。可选 `wix-upgrade-code`、`help`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri inspect` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `wix-upgrade-code` | 打印 MSI installer 使用的默认 Upgrade Code，该值由 `productName` 派生。 |
| `help` | 打印本命令或指定子命令的帮助。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 `wix-upgrade-code` 子命令帮助 | `pnpm tauri inspect help wix-upgrade-code` |
| `-v, --verbose...` | 输出顶层命令详细日志 | `pnpm tauri inspect -v -h` |
| `-h, --help` | 查看 inspect 顶层帮助 | `pnpm tauri inspect -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri inspect -V` |

## inspect wix-upgrade-code

`inspect wix-upgrade-code` 用于打印 MSI installer 默认 Upgrade Code。该值由 `productName` 派生，可用于排查 Windows MSI 升级识别、安装器升级路径或 WiX 配置相关问题。

### 用法

```bash
pnpm tauri inspect wix-upgrade-code [OPTIONS]
```

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri inspect wix-upgrade-code` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `-v, --verbose...` | 输出 MSI Upgrade Code 时打印详细日志 | `pnpm tauri inspect wix-upgrade-code -v` |
| `-h, --help` | 查看 wix-upgrade-code 帮助 | `pnpm tauri inspect wix-upgrade-code -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri inspect wix-upgrade-code -V` |

## 本项目注意事项

- 该命令是官方 WiX/MSI 派生值检查入口；当前项目 Windows 发布产物只保留 NSIS `.exe`，通常不需要在发布流程中使用它。
- `inspect wix-upgrade-code` 是只读检查命令；核对文档时可运行 `-h/--help`，如需读取实际值再单独确认。
