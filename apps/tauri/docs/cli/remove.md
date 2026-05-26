# tauri remove

`tauri remove` 用于从当前项目移除 Tauri 插件。命令会修改项目依赖和相关代码，属于会改变工程结构的命令，不应写入 `package.json` scripts；执行前应确认前端调用、Rust 注册逻辑和 capabilities 权限都已清理。

## 基本命令

```bash
pnpm tauri remove <plugin>
```

## 用法

```bash
pnpm tauri remove [OPTIONS] <PLUGIN>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<PLUGIN>` | 要移除的插件名称，例如 `opener`、`fs`、`updater`。官方 help 描述为 `The plugin to remove`；通常传入不带 `tauri-plugin-` 前缀的插件短名。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri remove` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<PLUGIN>` | 移除官方插件 | `pnpm tauri remove opener` |
| `-v, --verbose...` | 移除插件并输出详细日志 | `pnpm tauri remove opener -v` |
| `-h, --help` | 查看 remove 帮助 | `pnpm tauri remove -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri remove -V` |

## 本项目注意事项

- 移除插件前确认前端代码、Rust 注册逻辑和 capabilities 中不再引用它。
- 本文档只记录命令参考；不要为了验证示例而实际运行 `pnpm tauri remove ...`，否则会改动项目依赖和代码。
