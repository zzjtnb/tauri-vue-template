# tauri migrate

`tauri migrate` 用于将 Tauri v1 项目迁移到 Tauri v2。本项目已经是 Tauri v2 工程，通常不需要执行。迁移命令可能修改 Tauri 配置、Rust 代码和前端依赖，执行前应确认当前工程确实是 v1 遗留项目，并先做好版本控制或备份。

## 基本命令

```bash
pnpm tauri migrate
```

## 用法

```bash
pnpm tauri migrate [OPTIONS]
```

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose` | 启用更详细的迁移日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri migrate` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `-v, --verbose` | 执行迁移时输出详细日志 | `pnpm tauri migrate -v` |
| `-h, --help` | 查看 migrate 帮助 | `pnpm tauri migrate -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri migrate -V` |

## 本项目注意事项

- 当前项目使用 Tauri v2，不要把 `migrate` 写入 `package.json` scripts。
- 迁移命令面向 v1 到 v2；对已经是 v2 的工程，通常不应执行。
- 迁移可能修改配置、源码和依赖；执行前应确认工作区状态可回滚。
