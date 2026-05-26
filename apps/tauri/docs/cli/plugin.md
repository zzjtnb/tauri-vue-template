# tauri plugin

`tauri plugin` 用于管理或创建 Tauri 插件项目。它面向插件作者，不是普通应用开发的日常命令；如果只是安装官方插件，通常应使用 `pnpm tauri add <plugin>`。

## 基本命令

```bash
pnpm tauri plugin -h
pnpm tauri plugin new <plugin-name>
pnpm tauri plugin init [plugin-name]
pnpm tauri plugin android init [plugin-name]
pnpm tauri plugin ios init [plugin-name]
```

## 用法

```bash
pnpm tauri plugin [OPTIONS] <COMMAND>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的插件子命令。可选 `new`、`init`、`android`、`ios`、`help`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-h, --help` | 查看 `tauri plugin` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `new` | 初始化一个新的 Tauri 插件项目。 |
| `init` | 在已有目录中初始化 Tauri 插件项目。 |
| `android` | 管理 Tauri 插件的 Android project。 |
| `ios` | 管理 Tauri 插件的 iOS project。 |
| `help` | 打印本命令或指定子命令的帮助。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 `new` 子命令帮助 | `pnpm tauri plugin help new` |
| `-v, --verbose...` | 输出顶层命令详细日志 | `pnpm tauri plugin -v -h` |
| `-h, --help` | 查看 plugin 顶层帮助 | `pnpm tauri plugin -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin -V` |

## plugin new

`plugin new` 用于初始化一个新的 Tauri 插件项目。

### 用法

```bash
pnpm tauri plugin new [OPTIONS] <PLUGIN_NAME>
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<PLUGIN_NAME>` | Tauri 插件名称。该值会用于生成插件项目结构、包名和相关标识。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `--no-api` | 初始化插件时不生成 TypeScript API。适合只提供 Rust/native 侧能力或稍后手动补 API 的插件。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `--no-example` | 初始化时不生成 example project。适合只需要插件骨架、不需要示例应用的仓库。 |
| `-d, --directory <DIRECTORY>` | 设置初始化目标目录。 |
| `-a, --author <AUTHOR>` | 设置作者名称。 |
| `--android` | 初始化插件的 Android project。 |
| `--ios` | 初始化插件的 iOS project。 |
| `--mobile` | 同时初始化插件的 Android 和 iOS projects。 |
| `--ios-framework <IOS_FRAMEWORK>` | iOS project 使用的 framework 类型，默认 `spm`。可选值：`spm`、`xcode`。 |
| `--github-workflows` | 生成 GitHub workflows。 |
| `-t, --tauri-path <TAURI_PATH>` | 指定要使用的 Tauri 项目路径，相对当前工作目录。 |
| `-h, --help` | 查看 `tauri plugin new` 帮助；更完整说明可使用 `--help`。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<PLUGIN_NAME>` | 创建基础插件 | `pnpm tauri plugin new my-plugin` |
| `--no-api` | 不生成 TypeScript API | `pnpm tauri plugin new my-plugin --no-api` |
| `-v, --verbose...` | 创建时输出详细日志 | `pnpm tauri plugin new my-plugin -v` |
| `--no-example` | 不生成 example project | `pnpm tauri plugin new my-plugin --no-example` |
| `-d, --directory <DIRECTORY>` | 指定初始化目录 | `pnpm tauri plugin new my-plugin -d ../plugins` |
| `-a, --author <AUTHOR>` | 指定作者名称 | `pnpm tauri plugin new my-plugin -a 'example-author'` |
| `--android` | 初始化 Android plugin project | `pnpm tauri plugin new my-plugin --android` |
| `--ios` | 初始化 iOS plugin project | `pnpm tauri plugin new my-plugin --ios` |
| `--mobile` | 同时初始化 Android 和 iOS projects | `pnpm tauri plugin new my-plugin --mobile` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Swift Package Manager 作为 iOS framework | `pnpm tauri plugin new my-plugin --ios --ios-framework spm` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Xcode project 作为 iOS framework | `pnpm tauri plugin new my-plugin --ios --ios-framework xcode` |
| `--github-workflows` | 生成 GitHub workflows | `pnpm tauri plugin new my-plugin --github-workflows` |
| `-t, --tauri-path <TAURI_PATH>` | 指定 Tauri 项目路径 | `pnpm tauri plugin new my-plugin -t src-tauri` |
| `-h, --help` | 查看 new 帮助 | `pnpm tauri plugin new -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin new -V` |

## plugin init

`plugin init` 用于在已有目录中初始化 Tauri 插件项目。未传插件名时，CLI 会从当前目录推断插件名称。

### 用法

```bash
pnpm tauri plugin init [OPTIONS] [PLUGIN_NAME]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[PLUGIN_NAME]` | Tauri 插件名称。不传时会从当前目录推断。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `--no-api` | 初始化插件时不生成 TypeScript API。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `--no-example` | 初始化时不生成 example project。 |
| `-d, --directory <DIRECTORY>` | 设置初始化目标目录，默认是当前工作目录。 |
| `-a, --author <AUTHOR>` | 设置作者名称。 |
| `--android` | 初始化插件的 Android project。 |
| `--ios` | 初始化插件的 iOS project。 |
| `--mobile` | 同时初始化插件的 Android 和 iOS projects。 |
| `--ios-framework <IOS_FRAMEWORK>` | iOS project 使用的 framework 类型，默认 `spm`。可选值：`spm`、`xcode`。 |
| `--github-workflows` | 生成 GitHub workflows。 |
| `-t, --tauri-path <TAURI_PATH>` | 指定要使用的 Tauri 项目路径，相对当前工作目录。 |
| `-h, --help` | 查看 `tauri plugin init` 帮助；更完整说明可使用 `--help`。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[PLUGIN_NAME]` | 指定插件名初始化 | `pnpm tauri plugin init my-plugin` |
| `--no-api` | 不生成 TypeScript API | `pnpm tauri plugin init my-plugin --no-api` |
| `-v, --verbose...` | 初始化时输出详细日志 | `pnpm tauri plugin init my-plugin -v` |
| `--no-example` | 不生成 example project | `pnpm tauri plugin init my-plugin --no-example` |
| `-d, --directory <DIRECTORY>` | 指定初始化目录 | `pnpm tauri plugin init my-plugin -d ../plugin-dir` |
| `-a, --author <AUTHOR>` | 指定作者名称 | `pnpm tauri plugin init my-plugin -a 'example-author'` |
| `--android` | 初始化 Android plugin project | `pnpm tauri plugin init my-plugin --android` |
| `--ios` | 初始化 iOS plugin project | `pnpm tauri plugin init my-plugin --ios` |
| `--mobile` | 同时初始化 Android 和 iOS projects | `pnpm tauri plugin init my-plugin --mobile` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Swift Package Manager 作为 iOS framework | `pnpm tauri plugin init my-plugin --ios --ios-framework spm` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Xcode project 作为 iOS framework | `pnpm tauri plugin init my-plugin --ios --ios-framework xcode` |
| `--github-workflows` | 生成 GitHub workflows | `pnpm tauri plugin init my-plugin --github-workflows` |
| `-t, --tauri-path <TAURI_PATH>` | 指定 Tauri 项目路径 | `pnpm tauri plugin init my-plugin -t src-tauri` |
| `-h, --help` | 查看 init 帮助 | `pnpm tauri plugin init -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin init -V` |

## plugin android

`plugin android` 用于管理 Tauri 插件的 Android project。

### 用法

```bash
pnpm tauri plugin android [OPTIONS] <COMMAND>
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的 Android 插件子命令。可选 `init`、`help`。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri plugin android` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `init` | 为已有 Tauri 插件初始化 Android project。 |
| `help` | 打印本命令或指定子命令的帮助。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 Android init 帮助 | `pnpm tauri plugin android help init` |
| `-v, --verbose...` | 输出 Android 命令详细日志 | `pnpm tauri plugin android -v -h` |
| `-h, --help` | 查看 Android 命令帮助 | `pnpm tauri plugin android -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin android -V` |

## plugin android init

`plugin android init` 用于为已有 Tauri 插件初始化 Android project。

### 用法

```bash
pnpm tauri plugin android init [OPTIONS] [PLUGIN_NAME]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[PLUGIN_NAME]` | Tauri 插件名称，必须和当前插件名称匹配。不传时会从当前目录推断。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-o, --out-dir <OUT_DIR>` | 输出目录，默认是当前工作目录。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri plugin android init` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[PLUGIN_NAME]` | 指定插件名初始化 Android project | `pnpm tauri plugin android init my-plugin` |
| `-o, --out-dir <OUT_DIR>` | 指定输出目录 | `pnpm tauri plugin android init my-plugin -o ../plugin-dir` |
| `-v, --verbose...` | 输出详细日志 | `pnpm tauri plugin android init my-plugin -v` |
| `-h, --help` | 查看 Android init 帮助 | `pnpm tauri plugin android init -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin android init -V` |

## plugin ios

`plugin ios` 用于管理 Tauri 插件的 iOS project。

### 用法

```bash
pnpm tauri plugin ios [OPTIONS] <COMMAND>
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<COMMAND>` | 要执行的 iOS 插件子命令。可选 `init`、`help`。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `-h, --help` | 查看 `tauri plugin ios` 帮助。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 子命令

| 子命令 | 完整说明 |
| --- | --- |
| `init` | 为已有 Tauri 插件初始化 iOS project。 |
| `help` | 打印本命令或指定子命令的帮助。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<COMMAND>` | 查看 iOS init 帮助 | `pnpm tauri plugin ios help init` |
| `-v, --verbose...` | 输出 iOS 命令详细日志 | `pnpm tauri plugin ios -v -h` |
| `-h, --help` | 查看 iOS 命令帮助 | `pnpm tauri plugin ios -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin ios -V` |

## plugin ios init

`plugin ios init` 用于为已有 Tauri 插件初始化 iOS project。

### 用法

```bash
pnpm tauri plugin ios init [OPTIONS] [PLUGIN_NAME]
```

### 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[PLUGIN_NAME]` | Tauri 插件名称，必须和当前插件名称匹配。不传时会从当前目录推断。 |

### 选项

| 参数 | 完整说明 |
| --- | --- |
| `-o, --out-dir <OUT_DIR>` | 输出目录，默认是当前工作目录。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度。 |
| `--ios-framework <IOS_FRAMEWORK>` | iOS project 使用的 framework 类型，默认 `spm`。可选值：`spm`、`xcode`。 |
| `-h, --help` | 查看 `tauri plugin ios init` 帮助；更完整说明可使用 `--help`。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

### 完整参数覆盖示例

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[PLUGIN_NAME]` | 指定插件名初始化 iOS project | `pnpm tauri plugin ios init my-plugin` |
| `-o, --out-dir <OUT_DIR>` | 指定输出目录 | `pnpm tauri plugin ios init my-plugin -o ../plugin-dir` |
| `-v, --verbose...` | 输出详细日志 | `pnpm tauri plugin ios init my-plugin -v` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Swift Package Manager 作为 iOS framework | `pnpm tauri plugin ios init my-plugin --ios-framework spm` |
| `--ios-framework <IOS_FRAMEWORK>` | 使用 Xcode project 作为 iOS framework | `pnpm tauri plugin ios init my-plugin --ios-framework xcode` |
| `-h, --help` | 查看 iOS init 帮助 | `pnpm tauri plugin ios init -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri plugin ios init -V` |

## 本项目注意事项

- 这是插件作者命令；普通 app 功能开发通常不需要 `tauri plugin new/init`。
- 如果只是安装官方插件，用 `pnpm tauri add <plugin>`，不是 `tauri plugin new`。
- `plugin new/init/android init/ios init` 会创建或修改项目文件；本文示例用于说明参数覆盖，不要在当前应用仓库中直接运行这些创建类命令。
