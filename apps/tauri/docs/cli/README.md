# Tauri CLI 命令文档

本目录按 Tauri 官方顶层命令拆分维护 CLI 参考文档。文档来源标准必须对齐 Tauri 官方文档源码，而不是凭经验简化。

官方文档仓库：

```text
https://github.com/tauri-apps/tauri-docs
```

可选本地官方文档源码目录：

```text
<Tauri 官方文档源码目录>
```

CLI reference 的官方生成方式在：

```text
<Tauri 官方文档源码目录>/packages/cli-generator/build.ts
```

该生成器递归执行 `pnpm tauri <command> --help`，并保留命令描述、用法、位置参数、选项、环境变量、默认值、possible values、约束和风险说明。本目录文档的详细度不得低于这个官方输出标准。

## 使用原则

- `package.json` 保留项目高频 Tauri 入口：`tauri:*` 用于通用入口；平台入口使用 `android:*`、`ios:*`、`mac:*`、`windows:*`、`linux:*`。
- 不把所有官方子命令都逐个包装成 scripts；低频工具命令仍通过 `pnpm tauri ...` 直接透传。
- 每个顶层命令独立成文，避免把所有内容混到一个超长文档里。
- 参数表使用中文标题，但参数格式按官方风格：短参在前，例如 `-t, --target <TARGET>`。
- `完整参数覆盖示例` 必须逐项覆盖该命令的每个位置参数和每个选项，不能只写几个常见组合。

## 文档索引

| 文档 | 覆盖命令 | 说明 |
| --- | --- | --- |
| [init.md](./init.md) | `tauri init` | 在已有项目中初始化 Tauri 工程。 |
| [dev.md](./dev.md) | `tauri dev` | 桌面端开发模式。 |
| [build.md](./build.md) | `tauri build` | release 构建并生成 bundles/installers。 |
| [bundle.md](./bundle.md) | `tauri bundle` | 为已构建应用生成 bundles/installers。 |
| [android.md](./android.md) | `tauri android` | Android 初始化、开发、构建和运行。 |
| [ios.md](./ios.md) | `tauri ios` | iOS 初始化、开发、构建和运行。 |
| [migrate.md](./migrate.md) | `tauri migrate` | 从 Tauri v1 迁移到 v2。 |
| [info.md](./info.md) | `tauri info` | 查看环境、工具链和项目配置摘要。 |
| [add.md](./add.md) | `tauri add` | 添加 Tauri 插件。 |
| [remove.md](./remove.md) | `tauri remove` | 移除 Tauri 插件。 |
| [plugin.md](./plugin.md) | `tauri plugin` | 创建或管理 Tauri 插件项目。 |
| [icon.md](./icon.md) | `tauri icon` | 生成各平台图标资源。 |
| [signer.md](./signer.md) | `tauri signer` | 生成 updater 签名密钥或签名文件。 |
| [completions.md](./completions.md) | `tauri completions` | 生成 shell 自动补全脚本。 |
| [permission.md](./permission.md) | `tauri permission` | 管理或创建权限。 |
| [capability.md](./capability.md) | `tauri capability` | 管理或创建 capabilities。 |
| [inspect.md](./inspect.md) | `tauri inspect` | 检查 Tauri 派生值。 |

## 更新检查清单

更新任一命令文档前，先运行对应 help 命令核对官方输出：

```bash
pnpm tauri <command> -h
```

更新时至少检查：

- 命令描述是否保留官方行为说明。
- `用法` 是否和官方 Usage 一致。
- `位置参数` 是否完整。
- `选项` 是否完整，且短参在前。
- 环境变量、默认值、possible values 是否保留。
- `完整参数覆盖示例` 是否逐项覆盖所有位置参数和选项。
- 示例命令是否优先使用短参数。

## 本项目入口

`android:*`、`ios:*`、`harmony:*` 等脚本在 `apps/tauri/package.json`。两种写法等价：

- **方式 A**：`cd apps/tauri` 后 `pnpm android:build`
- **方式 B**：仓库根 `pnpm --dir apps/tauri android:build`

下面列出的命令为**方式 A 简写**（在 `apps/tauri` 内执行）：

```bash
pnpm tauri:init
pnpm tauri:info
pnpm tauri:icon
pnpm tauri:signer
pnpm tauri:dev
pnpm tauri:build
pnpm android:init
pnpm android:dev
pnpm android:build
pnpm android:run
pnpm ios:init
pnpm ios:dev
pnpm ios:build
pnpm ios:run
pnpm mac:dev
pnpm mac:build
pnpm windows:dev
pnpm windows:build
pnpm linux:dev
pnpm linux:build
pnpm harmony
pnpm harmony:init
pnpm harmony:dev
pnpm harmony:build
```

低频官方 CLI 命令仍直接透传：

```bash
pnpm tauri <command>
```
