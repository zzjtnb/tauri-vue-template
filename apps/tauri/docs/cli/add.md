# tauri add

`tauri add` 用于把 Tauri 插件添加到当前项目。命令会修改项目依赖并更新相关注册代码，属于会改变工程结构的命令，不应写入 `package.json` scripts；执行前应确认要添加的插件名称、来源分支或版本。

## 基本命令

```bash
pnpm tauri add <plugin>
```

## 用法

```bash
pnpm tauri add [OPTIONS] <PLUGIN>
```

## 位置参数

| 参数 | 完整说明 |
| --- | --- |
| `<PLUGIN>` | 要添加的插件名称，例如 `opener`、`fs`、`updater`。官方 help 描述为 `The plugin to add`；通常传入不带 `tauri-plugin-` 前缀的插件短名。 |

## 选项

| 参数 | 完整说明 |
| --- | --- |
| `-t, --tag <TAG>` | 使用指定 Git tag 的插件版本。适合锁定到已发布的插件 tag，例如 `v2.5.4`；不要同时混用 `--tag`、`--rev`、`--branch` 指向不同来源。 |
| `-v, --verbose...` | 启用更详细的 CLI 日志。该参数可重复传入以增加日志详细程度，例如 `-vv`。 |
| `-r, --rev <REV>` | 使用指定 Git revision。适合验证某个 commit 或临时修复版本；应传入明确的 commit SHA，避免来源不可复现。 |
| `-b, --branch <BRANCH>` | 使用指定 Git branch。适合跟随插件开发分支，例如 `next`；正式项目更建议使用稳定 tag 或明确 revision。 |
| `--no-fmt` | 添加插件后不运行 `rustfmt` 格式化代码。只有在本地没有 Rust formatter、需要保留当前格式或准备手动格式化时使用。 |
| `-h, --help` | 查看 `tauri add` 帮助；`-h` 通常输出摘要，完整说明以当前 CLI 输出为准。 |
| `-V, --version` | 输出 Tauri CLI 版本。 |

## 完整参数覆盖示例

这一节必须逐项覆盖“位置参数 + 每个选项”。如果新增参数，必须同步新增示例行。

| 覆盖项 | 场景 | 命令 |
| --- | --- | --- |
| `<PLUGIN>` | 添加官方插件 | `pnpm tauri add opener` |
| `-t, --tag <TAG>` | 添加指定 tag 的插件版本 | `pnpm tauri add opener -t v2.5.4` |
| `-v, --verbose...` | 添加插件并输出详细日志 | `pnpm tauri add opener -v` |
| `-r, --rev <REV>` | 添加指定 revision 的插件版本 | `pnpm tauri add opener -r 012345abcdef` |
| `-b, --branch <BRANCH>` | 添加指定 branch 的插件版本 | `pnpm tauri add opener -b next` |
| `--no-fmt` | 添加插件但跳过 rustfmt | `pnpm tauri add opener --no-fmt` |
| `-h, --help` | 查看 add 帮助 | `pnpm tauri add -h` |
| `-V, --version` | 查看 CLI 版本 | `pnpm tauri add -V` |

## 本项目注意事项

- 添加插件后要同步检查 `src-tauri/Cargo.toml`、`src-tauri/src/lib.rs`、前端依赖和 `src-tauri/capabilities/*.json`。
- Tauri v2 插件权限默认收紧，只安装插件不代表前端 API 已有权限。
- 本文档只记录命令参考；不要为了验证示例而实际运行 `pnpm tauri add ...`，否则会改动项目依赖和代码。
