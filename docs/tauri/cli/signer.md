# tauri signer

`tauri signer` 用于为 Tauri updater 生成签名密钥，或使用 updater 私钥对文件签名。签名私钥属于敏感信息，不要提交到 Git，也不要写入公开日志。

## 基本命令

```bash
pnpm tauri signer -h
pnpm tauri signer generate
pnpm tauri signer sign <file>
```

## 用法

```bash
pnpm tauri signer [OPTIONS] <COMMAND>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的签名子命令。可选 `sign`、`generate`、`help`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri signer` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `sign` | 对指定文件签名。 |
| `generate` | 生成用于文件签名的新 signing key。 |
| `help` | 打印本命令或指定子命令的帮助。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 `generate` 子命令帮助 | `pnpm tauri signer help generate` |
| `-v, --verbose` | 输出顶层命令详细日志 | `pnpm tauri signer -v -h` |
| `-h, --help` | 查看 signer 顶层帮助 | `pnpm tauri signer -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri signer -V` |

## signer generate

`signer generate` 用于生成新的 signing key，供 updater 文件签名使用。

### 用法

```bash
pnpm tauri signer generate [OPTIONS]
```

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-p, --password <PASSWORD>` | 设置签名时使用的私钥密码。密码会保护生成的私钥；不要在 shell history、CI 日志或公开配置中暴露真实密码。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-w, --write-keys <WRITE_KEYS>` | 将私钥写入指定文件路径。不传时通常会输出到终端或按交互流程处理。 |
| `-f, --force` | 指定路径已存在私钥时仍覆盖。该参数会覆盖敏感密钥文件，使用前必须确认目标路径。 |
| `--ci` | 跳过交互提示，适合 CI 或无人值守生成；也可通过环境变量 `CI` 启用。 |
| `-h, --help` | 查看 `tauri signer generate` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 环境变量

| 变量 | 完整说明 |
| --- | --- |
| `CI` | 设置后等同于启用 `--ci`，用于跳过交互提示。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `-p, --password <PASSWORD>` | 生成带密码保护的私钥 | `pnpm tauri signer generate -p '<password>'` |
| `-v, --verbose` | 生成时输出详细日志 | `pnpm tauri signer generate -v` |
| `-w, --write-keys <WRITE_KEYS>` | 将私钥写入指定文件 | `pnpm tauri signer generate -w ~/.tauri/zzjt.key` |
| `-f, --force` | 强制覆盖指定路径上的已有私钥 | `pnpm tauri signer generate -w ~/.tauri/zzjt.key -f --ci` |
| `--ci` | CI 中跳过交互提示 | `pnpm tauri signer generate -w ~/.tauri/zzjt.key -p '<password>' --ci` |
| `CI` | 通过环境变量跳过交互提示 | `CI=true pnpm tauri signer generate -w ~/.tauri/zzjt.key -p '<password>'` |
| `-h, --help` | 查看 generate 帮助 | `pnpm tauri signer generate -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri signer generate -V` |

## signer sign

`signer sign` 用于对指定文件签名。私钥可以从命令行字符串、私钥文件路径或环境变量读取。

这里的文件通常是 Tauri updater 更新包文件。示例假设发布流程把更新包收集到 `release/updater/`：

```bash
pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz
pnpm tauri signer sign ./release/updater/windows/zzjt.nsis.zip
pnpm tauri signer sign ./release/updater/linux/zzjt.AppImage.tar.gz
```

带私钥文件和密码的完整示例：

```bash
pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -f ~/.tauri/zzjt.key -p '<password>'
```

注意：这里签的是 Tauri updater 更新包文件，用于更新校验；它不等同于 macOS/iOS/Android/Windows 平台代码签名。

### 用法

```bash
pnpm tauri signer sign [OPTIONS] <FILE>
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<FILE>` | 要签名的文件路径。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-k, --private-key <PRIVATE_KEY>` | 从字符串加载私钥；也可通过环境变量 `TAURI_SIGNING_PRIVATE_KEY` 设置。适合 CI secret 注入，不要把真实私钥写进仓库或日志。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-f, --private-key-path <PRIVATE_KEY_PATH>` | 从文件加载私钥；也可通过环境变量 `TAURI_SIGNING_PRIVATE_KEY_PATH` 设置。 |
| `-p, --password <PASSWORD>` | 设置签名时使用的私钥密码；也可通过环境变量 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 设置。 |
| `-h, --help` | 查看 `tauri signer sign` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 环境变量

| 变量 | 完整说明 |
| --- | --- |
| `TAURI_SIGNING_PRIVATE_KEY` | 私钥字符串，对应 `-k, --private-key <PRIVATE_KEY>`。 |
| `TAURI_SIGNING_PRIVATE_KEY_PATH` | 私钥文件路径，对应 `-f, --private-key-path <PRIVATE_KEY_PATH>`。 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码，对应 `-p, --password <PASSWORD>`。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<FILE>` | 指定要签名的 release 文件 | `pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -f ~/.tauri/zzjt.key` |
| `-k, --private-key <PRIVATE_KEY>` | 使用私钥字符串签名 | `pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -k '<private-key>' -p '<password>'` |
| `-v, --verbose` | 签名时输出详细日志 | `pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -f ~/.tauri/zzjt.key -v` |
| `-f, --private-key-path <PRIVATE_KEY_PATH>` | 使用私钥文件签名 | `pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -f ~/.tauri/zzjt.key` |
| `-p, --password <PASSWORD>` | 使用私钥密码签名 | `pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz -f ~/.tauri/zzjt.key -p '<password>'` |
| `TAURI_SIGNING_PRIVATE_KEY` | 通过环境变量注入私钥字符串 | `TAURI_SIGNING_PRIVATE_KEY='<private-key>' TAURI_SIGNING_PRIVATE_KEY_PASSWORD='<password>' pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz` |
| `TAURI_SIGNING_PRIVATE_KEY_PATH` | 通过环境变量注入私钥文件路径 | `TAURI_SIGNING_PRIVATE_KEY_PATH=~/.tauri/zzjt.key pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 通过环境变量注入私钥密码 | `TAURI_SIGNING_PRIVATE_KEY_PATH=~/.tauri/zzjt.key TAURI_SIGNING_PRIVATE_KEY_PASSWORD='<password>' pnpm tauri signer sign ./release/updater/macos/zzjt.app.tar.gz` |
| `-h, --help` | 查看 sign 帮助 | `pnpm tauri signer sign -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri signer sign -V` |

## 本项目注意事项

- 签名私钥属于敏感信息，不要提交到 Git。
- `src-tauri/tauri.conf.json` 中 updater 使用的 pubkey 必须和私钥匹配。
- `signer generate` 会生成敏感密钥，`signer sign` 会对文件执行签名；本文示例用于说明参数覆盖，核对文档时只运行 `-h/--help`。
