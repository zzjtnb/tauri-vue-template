# tauri icon

`tauri icon` 用于从源图标生成各主要平台所需图标。它会写入 Tauri icons 目录，属于会改动资源文件的命令。输入可以是带透明通道的正方形 PNG 或 SVG；默认输入是 `./app-icon.png`。

## 基本命令

```bash
pnpm tauri icon [input]
```

## 用法

```bash
pnpm tauri icon [OPTIONS] [INPUT]
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `[INPUT]` | 源图标路径。源图标必须是带透明通道的正方形 PNG 或 SVG。默认值：`./app-icon.png`。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-o, --output <OUTPUT>` | 输出目录。默认是 `tauri.conf.json` 文件旁边的 `icons` 目录；本项目通常对应 `src-tauri/icons/`。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-p, --png <PNG>` | 自定义要生成的 PNG 图标尺寸。设置后不会生成默认图标集合，只生成指定尺寸；可传多个尺寸，例如 `-p 32 128 256`。 |
| `--ios-color <IOS_COLOR>` | iOS 图标背景色，字符串格式遵循 W3C CSS Color Module Level 4。默认值：`#fff`。 |
| `-h, --help` | 查看 `tauri icon` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `[INPUT]` | 使用默认 `./app-icon.png` 生成图标 | `pnpm tauri icon` |
| `[INPUT]` | 指定 PNG 源图标 | `pnpm tauri icon ./assets/app-icon.png` |
| `[INPUT]` | 指定 SVG 源图标 | `pnpm tauri icon ./assets/app-icon.svg` |
| `-o, --output <OUTPUT>` | 输出到指定 icons 目录 | `pnpm tauri icon ./assets/app-icon.png -o src-tauri/icons` |
| `-v, --verbose...` | 生成图标并输出详细日志 | `pnpm tauri icon ./assets/app-icon.png -v` |
| `-p, --png <PNG>` | 只生成指定 PNG 尺寸，不生成默认图标集合 | `pnpm tauri icon ./assets/app-icon.png -p 32 128 256` |
| `--ios-color <IOS_COLOR>` | 指定 iOS 背景色 | `pnpm tauri icon ./assets/app-icon.png --ios-color '#ffffff'` |
| `-h, --help` | 查看 icon 帮助 | `pnpm tauri icon -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri icon -V` |

## 本项目注意事项

- 当前项目标准图标命令是 `pnpm tauri icon ../../packages/assets/public/logo.png`。
- 官方 Tauri 图标目录是 `src-tauri/icons/`。
- 本文档只记录命令参考；不要为了验证示例而实际运行 `pnpm tauri icon ...`，否则会生成或覆盖图标资源。
