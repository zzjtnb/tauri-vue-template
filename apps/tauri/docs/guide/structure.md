# 最推荐的目录结构（官方风格 + 社区常见）

这不是 Tauri 官方唯一规定的目录结构，但它符合 Tauri 2 官方模板的 `main.rs + lib.rs` 入口方式，也是社区中常见的工程化组织方式。

目标：尽量贴近官方模板，同时保持中大型多端项目的可维护性；文档保留完整推荐结构，实际代码只生成当前项目用到的模块。

## 完整推荐结构（目标，非当前清单）

下面是目标结构，用于约定模块职责和后续扩展方向，不表示当前仓库已创建下列全部目录。当前已落地文件见本文末尾「当前项目实际结构」。

```text
src-tauri/
├── Cargo.toml                    # Rust 项目依赖与构建配置
├── build.rs                      # Tauri 构建脚本（通常由模板生成）
├── tauri.conf.json               # Tauri 应用配置（窗口、打包、更新等）

├── capabilities/                 # Tauri 2 权限配置目录
│   ├── default.json              # 默认跨平台权限声明
│   ├── desktop.json              # 桌面端权限声明
│   └── ohos.json                 # OpenHarmony 权限声明

├── icons/                        # 应用图标资源
├── gen/                          # 移动端原生工程（Android/iOS）

└── src/                          # Rust 后端源码目录
    ├── main.rs                   # 程序入口，只调用 lib.rs 中的 run()
    ├── lib.rs                    # 应用装配入口：注册插件、命令、状态

    ├── commands/                 # 前端 invoke 调用的命令层
    │   ├── mod.rs                # 导出 commands 模块
    │   ├── app.rs                # 应用相关命令
    │   ├── file.rs               # 文件相关命令
    │   ├── system.rs             # 系统信息相关命令
    │   └── updater.rs            # 更新相关命令

    ├── services/                 # 业务逻辑层（不直接暴露给前端）
    │   ├── mod.rs                # 导出 services 模块
    │   ├── file_service.rs       # 文件处理逻辑
    │   ├── upload_service.rs     # 上传逻辑
    │   ├── updater_service.rs    # 更新逻辑
    │   └── chat_service.rs       # AI 对话逻辑（如需要）

    ├── state/                    # 全局共享状态（tauri::State）
    │   ├── mod.rs                # 导出 state 模块
    │   └── app_state.rs          # AppState 定义

    ├── models/                   # 数据结构定义
    │   ├── mod.rs                # 导出 models 模块
    │   ├── config.rs             # 配置结构体
    │   ├── request.rs            # 请求结构体
    │   └── response.rs           # 响应结构体

    ├── errors/                   # 自定义错误类型
    │   ├── mod.rs                # 导出 errors 模块
    │   └── app_error.rs          # AppError 定义

    ├── utils/                    # 通用工具函数
    │   ├── mod.rs                # 导出 utils 模块
    │   ├── path.rs               # 路径处理工具
    │   ├── fs.rs                 # 文件系统工具
    │   └── logger.rs             # 日志初始化工具

    └── plugins/                  # 各 Tauri 插件初始化封装（可选）
        ├── mod.rs                # 导出 plugins 模块
        ├── opener.rs             # opener 插件配置
        ├── updater.rs            # updater 插件配置
        ├── autostart.rs          # autostart 插件配置
        └── window_state.rs       # window-state 插件配置
```

## 模块组织规则

- `lib.rs` 只声明顶层模块，不直接声明每个具体文件。
- `lib.rs` 只负责应用装配：注册插件、命令、状态和运行事件。
- 具体业务文件只实现实际逻辑，不负责应用装配。
- 文档中的完整结构用于约定方向，不是一次性生成清单；当前没有实际代码的目录不提前生成空文件。

典型写法：

```rust
mod commands;
mod services;
mod state;

use commands::*;
use services::*;
use state::AppState;
```

这样 `lib.rs` 可以保持简洁，只负责应用装配：

```rust
tauri::Builder::default()
    .manage(AppState::default())
    .invoke_handler(tauri::generate_handler![greet, opened_urls])
    .run(handle_run_event);
```

## 模块导出边界

每个目录的 `mod.rs` 都是该目录对外暴露内容的边界。通用原则是：模块可以存在，但不代表它必须被 `lib.rs` 直接 `use`；只有父模块或装配层真正需要的入口，才由 `mod.rs` 导出。

```rust
mod file;

pub(crate) use file::opened_urls;
```

- `commands/mod.rs`：导出需要注册到 `generate_handler!` 的 command。
- `services/mod.rs`：导出 `lib.rs` 或其它模块确实需要调用的服务入口；普通 service 函数优先留在子模块里。
- `state/mod.rs`：导出需要注入或共享的 state 类型。
- `models/mod.rs`：导出跨模块共享的数据结构；模块内部专用类型不导出。
- `errors/mod.rs`：导出统一错误类型；局部错误不提升到顶层。
- `utils/mod.rs`：只导出确实被多个模块复用的工具函数。
- `plugins/mod.rs`：只导出插件初始化入口，不暴露插件内部配置细节。

例如 `services` 被 `commands` 使用、`models` 被 `services` 使用、`utils` 被各模块内部使用时，它们只需要在对应父模块中声明和按需导出，不需要都提升到 `lib.rs` 作用域。

新增文件时，优先先放在对应子模块内部；只有父模块或 `lib.rs` 真正需要使用时，再由该目录的 `mod.rs` 统一导出。

按需创建目录时也遵循同一原则：`plugins/` 只有在插件初始化出现复杂配置、平台条件或复用逻辑时再拆；`models/`、`errors/`、`utils/` 只有出现跨模块数据结构、统一错误类型或复用工具函数时再创建。

## 最佳实践

通常情况下，`lib.rs` 保持在这个量级就比较整洁：

- `mod xxx;`：7～10 行。
- `use xxx::*;` 或少量明确装配入口：2～4 行。
- `run()`：20～50 行。

这些是工程组织上的经验值，不是硬性限制；重点是让 `lib.rs` 只负责装配，不承载具体业务实现。

## 职责边界

| 层级 | 职责 |
| --- | --- |
| `main.rs` | 程序入口，只调用 `lib.rs` 中的 `run()`。 |
| `lib.rs` | 声明顶层模块，注册插件、命令、状态和运行事件。 |
| `commands/` | 前端 `invoke` 命令层，只做参数接收和结果返回。 |
| `services/` | 业务逻辑层，不直接暴露给前端。 |
| `state/` | `tauri::State<T>` 注入的全局共享状态。 |
| `models/` | 请求、响应、配置等数据结构；有跨模块结构时再创建。 |
| `errors/` | 统一错误类型；有统一错误返回需求时再创建。 |
| `utils/` | 通用工具函数；有复用逻辑时再创建。 |
| `plugins/` | 插件初始化封装；插件配置超过简单一行注册时再拆。 |

## 当前项目实际结构

当前已落地结构：

```text
src-tauri/src/
├── main.rs
├── lib.rs
├── commands/
│   ├── mod.rs
│   └── file.rs
├── services/
│   ├── mod.rs
│   └── file_service.rs
└── state/
    ├── mod.rs
    └── app_state.rs
```

## 当前 file associations 映射

| 能力 | 文件 |
| --- | --- |
| `opened_urls` command | `src-tauri/src/commands/file.rs` |
| 打开文件 URL 状态 | `src-tauri/src/state/app_state.rs` |
| `RunEvent::Opened` 处理和 `opened` event 发送 | `src-tauri/src/services/file_service.rs`，当前暂放 `services/`；后续如果原生运行事件变多，再考虑拆出专门事件模块。 |
| Builder 装配 | `src-tauri/src/lib.rs` |
