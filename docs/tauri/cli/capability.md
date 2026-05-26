# tauri capability

`tauri capability` 用于管理或创建应用 capabilities。Tauri v2 的权限模型依赖 capabilities 文件，用它将窗口、权限和可访问范围关联起来。

## 基本命令

```bash
pnpm tauri capability -h
pnpm tauri capability new [identifier]
```

## 用法

```bash
pnpm tauri capability [OPTIONS] <COMMAND>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的 capability 子命令。可选 `new`、`help`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri capability` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `new` | 创建新的 capability 文件。当前 CLI help 文案为 “Create a new permission file”，实际命令语义是创建 capability。 |
| `help` | 打印本命令或指定子命令的帮助。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 `new` 子命令帮助 | `pnpm tauri capability help new` |
| `-v, --verbose` | 输出顶层命令详细日志 | `pnpm tauri capability -v -h` |
| `-h, --help` | 查看 capability 顶层帮助 | `pnpm tauri capability -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri capability -V` |

## capability new

`capability new` 用于创建新的 capability 文件。

### 用法

```bash
pnpm tauri capability new [OPTIONS] [IDENTIFIER]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[IDENTIFIER]` | Capability identifier。用于标识要创建的 capability。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `--description <DESCRIPTION>` | Capability 描述。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `--windows <WINDOWS>` | Capability 关联的窗口。通常填写窗口 label，例如 `main`。 |
| `--permission <PERMISSION>` | Capability permissions。可多次使用以添加多个 permission，例如 `core:default`、`opener:default`。 |
| `--format <FORMAT>` | 输出文件格式，默认 `json`。可选值：`json`、`toml`。 |
| `-o, --out <OUT>` | 输出文件路径。 |
| `-h, --help` | 查看 `tauri capability new` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[IDENTIFIER]` | 创建指定 identifier 的 capability | `pnpm tauri capability new default` |
| `--description <DESCRIPTION>` | 创建带描述的 capability | `pnpm tauri capability new default --description 'Default desktop capability'` |
| `-v, --verbose` | 创建时输出详细日志 | `pnpm tauri capability new default -v` |
| `--windows <WINDOWS>` | 关联 main 窗口 | `pnpm tauri capability new default --windows main` |
| `--permission <PERMISSION>` | 添加单个 permission | `pnpm tauri capability new default --permission core:default` |
| `--permission <PERMISSION>` | 添加多个 permissions | `pnpm tauri capability new default --permission core:default --permission opener:default` |
| `--format <FORMAT>` | 输出 JSON 格式 | `pnpm tauri capability new default --format json` |
| `--format <FORMAT>` | 输出 TOML 格式 | `pnpm tauri capability new default --format toml` |
| `-o, --out <OUT>` | 输出到指定文件 | `pnpm tauri capability new default -o src-tauri/capabilities/default.json` |
| `-h, --help` | 查看 new 帮助 | `pnpm tauri capability new -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri capability new -V` |

## 本项目注意事项

- 官方 Tauri capabilities 位于 `src-tauri/capabilities/`。
- `capability new` 会创建 capability 文件；本文示例用于说明参数覆盖，核对文档时只运行 `-h/--help`。
