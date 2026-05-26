# tauri completions

`tauri completions` 用于生成 Tauri CLI 的 shell 自动补全脚本。官方 help 描述为为 Bash、Zsh、PowerShell 或 Fish 生成补全；当前 CLI 的 possible values 还包含 `elvish`。默认不指定输出文件时，补全脚本会打印到 stdout。

## 基本命令

```bash
pnpm tauri completions -s <shell>
```

## 用法

```bash
pnpm tauri completions [OPTIONS] --shell <SHELL>
```

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-s, --shell <SHELL>` | 要生成补全脚本的 shell。该选项必填。当前 possible values：`bash`、`elvish`、`fish`、`powershell`、`zsh`。 |
| `-v, --verbose` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-o, --output <OUTPUT>` | 补全脚本输出文件路径。默认不传时打印到 stdout，适合通过重定向写入个人 shell 配置目录。 |
| `-h, --help` | 查看 `tauri completions` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖每个选项。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `-s, --shell <SHELL>` | 生成 zsh 补全并打印到 stdout | `pnpm tauri completions -s zsh` |
| `-v, --verbose` | 生成 zsh 补全并输出详细日志 | `pnpm tauri completions -s zsh -v` |
| `-o, --output <OUTPUT>` | 生成 bash 补全文件 | `pnpm tauri completions -s bash -o ./tauri.bash` |
| `-s, --shell <SHELL>` | 生成 fish 补全并打印到 stdout | `pnpm tauri completions -s fish` |
| `-s, --shell <SHELL>` | 生成 powershell 补全并打印到 stdout | `pnpm tauri completions -s powershell` |
| `-s, --shell <SHELL>` | 生成 elvish 补全并打印到 stdout | `pnpm tauri completions -s elvish` |
| `-h, --help` | 查看 completions 帮助 | `pnpm tauri completions -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri completions -V` |

## 本项目注意事项

- 补全脚本通常属于个人 shell 环境配置，不建议提交到项目仓库。
- 如果只是查看命令帮助，运行 `pnpm tauri completions --help` 即可；不要把生成的补全脚本写入仓库路径。
