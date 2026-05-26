# tauri permission

`tauri permission` 用于管理或创建应用/插件权限。Tauri v2 默认权限收紧，插件和 core API 都需要对应 permission/capability 配置。

## 基本命令

```bash
pnpm tauri permission -h
pnpm tauri permission new [identifier]
pnpm tauri permission add <identifier> [capability]
pnpm tauri permission rm <identifier>
pnpm tauri permission ls [plugin]
```

## 用法

```bash
pnpm tauri permission [OPTIONS] <COMMAND>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的权限子命令。可选 `new`、`add`、`rm`、`ls`、`help`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri permission` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `new` | 创建新的 permission 文件。 |
| `add` | 将 permission 添加到 capabilities。 |
| `rm` | 删除 permission 文件，并从任何 capability 中移除对它的引用。 |
| `ls` | 列出应用可用的 permissions。 |
| `help` | 打印本命令或指定子命令的帮助。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 `new` 子命令帮助 | `pnpm tauri permission help new` |
| `-v, --verbose...` | 输出顶层命令详细日志 | `pnpm tauri permission -v -h` |
| `-h, --help` | 查看 permission 顶层帮助 | `pnpm tauri permission -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri permission -V` |

## permission new

`permission new` 用于创建新的 permission 文件。

### 用法

```bash
pnpm tauri permission new [OPTIONS] [IDENTIFIER]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[IDENTIFIER]` | Permission identifier。用于标识要创建的权限。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `--description <DESCRIPTION>` | Permission 描述。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-a, --allow <ALLOW>` | 允许的 command 列表。用于写入 permission 的 allow 列表；可多次使用以添加多个允许命令。 |
| `-d, --deny <DENY>` | 禁止的 command 列表。用于写入 permission 的 deny 列表；可多次使用以添加多个禁止命令。 |
| `--format <FORMAT>` | 输出文件格式，默认 `json`。可选值：`json`、`toml`。 |
| `-o, --out <OUT>` | 输出文件路径。 |
| `-h, --help` | 查看 `tauri permission new` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[IDENTIFIER]` | 创建指定 identifier 的权限文件 | `pnpm tauri permission new opened-urls` |
| `--description <DESCRIPTION>` | 创建带描述的权限 | `pnpm tauri permission new opened-urls --description 'Allow opened URLs command'` |
| `-v, --verbose...` | 创建时输出详细日志 | `pnpm tauri permission new opened-urls -v` |
| `-a, --allow <ALLOW>` | 声明允许命令 | `pnpm tauri permission new opened-urls -a opened_urls` |
| `-d, --deny <DENY>` | 声明禁止命令 | `pnpm tauri permission new file-access -d delete_file` |
| `--format <FORMAT>` | 输出 JSON 格式 | `pnpm tauri permission new opened-urls --format json` |
| `--format <FORMAT>` | 输出 TOML 格式 | `pnpm tauri permission new opened-urls --format toml` |
| `-o, --out <OUT>` | 输出到指定文件 | `pnpm tauri permission new opened-urls -o src-tauri/permissions/opened-urls.json` |
| `-h, --help` | 查看 new 帮助 | `pnpm tauri permission new -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri permission new -V` |

## permission add

`permission add` 用于把 permission 添加到 capabilities。

### 用法

```bash
pnpm tauri permission add [OPTIONS] <IDENTIFIER> [CAPABILITY]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<IDENTIFIER>` | 要添加的 permission identifier。 |
| `[CAPABILITY]` | 要添加该 permission 的 capability identifier。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri permission add` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<IDENTIFIER>` | 添加指定 permission | `pnpm tauri permission add opener:default default` |
| `[CAPABILITY]` | 添加到指定 capability | `pnpm tauri permission add fs:default default` |
| `-v, --verbose...` | 添加时输出详细日志 | `pnpm tauri permission add opener:default default -v` |
| `-h, --help` | 查看 add 帮助 | `pnpm tauri permission add -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri permission add -V` |

## permission rm

`permission rm` 用于删除 permission 文件，并从所有 capability 引用中移除该 permission。

### 用法

```bash
pnpm tauri permission rm [OPTIONS] <IDENTIFIER>
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<IDENTIFIER>` | 要删除的 permission identifier。删除某个插件所有权限时可使用类似 `<plugin-name>:*` 的标识。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri permission rm` 帮助；更完整说明可使用 `--help`。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<IDENTIFIER>` | 删除单个权限 | `pnpm tauri permission rm opened-urls` |
| `<IDENTIFIER>` | 删除某插件所有权限 | `pnpm tauri permission rm fs:*` |
| `-v, --verbose...` | 删除时输出详细日志 | `pnpm tauri permission rm opened-urls -v` |
| `-h, --help` | 查看 rm 帮助 | `pnpm tauri permission rm -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri permission rm -V` |

## permission ls

`permission ls` 用于列出应用可用的 permissions。

### 用法

```bash
pnpm tauri permission ls [OPTIONS] [PLUGIN]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[PLUGIN]` | 指定插件名称，只列出该插件的 permissions。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-f, --filter <FILTER>` | 按 permission identifier 过滤。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri permission ls` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[PLUGIN]` | 只列出 fs 插件权限 | `pnpm tauri permission ls fs` |
| `-f, --filter <FILTER>` | 按 identifier 过滤 | `pnpm tauri permission ls -f default` |
| `-v, --verbose...` | 列出时输出详细日志 | `pnpm tauri permission ls -v` |
| `-h, --help` | 查看 ls 帮助 | `pnpm tauri permission ls -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri permission ls -V` |

## 本项目注意事项

- 官方 Tauri 权限和 capability 主要位于 `src-tauri/capabilities/`。
- 修改权限后要同时验证前端 API 调用和 Rust 插件注册。
- `permission new/add/rm` 会创建、修改或删除权限相关文件；本文示例用于说明参数覆盖，核对文档时只运行 `-h/--help`。
