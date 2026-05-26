# 文档目录

本目录只维护仓库级规范文档。Tauri CLI、Tauri 开发说明和多平台接入指南放在 `apps/tauri/docs/`，与实际 Tauri 打包器代码放在同一个 workspace 包内维护。

## 当前结构

```text
docs/
├── README.md
└── guide/
    ├── Turborepo任务规范.md
    ├── workspace内部包消费.md
    └── 模块化编码规则.md
```

## 文档入口

| 文档 | 说明 |
| --- | --- |
| `guide/模块化编码规则.md` | 仓库模块化编码规则。 |
| `guide/Turborepo任务规范.md` | Turborepo 任务边界、根脚本和包级脚本规范。 |
| `guide/workspace内部包消费.md` | 内部包源码消费、`exports`、Vite 与 Turbo（dev/build 不走 dist）。 |
| `../apps/tauri/README.md` | Tauri 打包器脚本索引；**Android / iOS / 鸿蒙命令的两种执行方式**。 |
| `../apps/tauri/docs/guide/配置文件指南.md` | Tauri 配置标准；含「命令执行目录」说明。 |
| `../apps/tauri/docs/dev.md` | Tauri 工程重建与开发说明。 |
| `../apps/tauri/docs/cli/` | Tauri CLI 命令说明。 |
| `../apps/tauri/docs/guide/` | macOS、Windows、Linux、Android、iOS、OpenHarmony 等平台接入指南。 |

## 新增文档规则

- 仓库级规范放在 `docs/guide/`。
- Tauri 相关文档放在 `apps/tauri/docs/`。
- 包级使用文档放在对应 `packages/<name>/README.md` 或 `packages/<name>/docs/`。
- 不在文档索引里保留未创建目录；新增目录时同轮更新本索引。
