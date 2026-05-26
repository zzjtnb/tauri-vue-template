# @tauri-vue-template/utils/node

`node` 是 Node 运行时工具入口，面向 CLI、脚本和构建工具。

## 边界

- 可以依赖 `node:fs`、`node:path` 等 Node 内置模块。
- 不能从 `@tauri-vue-template/utils` 包根导出，避免污染浏览器构建边界。
- 前端应用禁止导入 `@tauri-vue-template/utils/node` 或其子路径。
- 新增导出必须有 TSDoc，并从本目录 `index.ts` 暴露。

## 当前能力

```ts
import { findFilesByExtension, inspectDebug, movePath, readJson, removePath, resolveInputPath, toRelativePath, uniqueFilePath, writeTextIfChanged } from '@tauri-vue-template/utils/node'
```

- `debug.ts`：把未知值格式化为适合日志和错误诊断的调试文本。
- `fs.ts`：目录创建、删除、跨设备移动、按需写入、递归查找、后缀查找、唯一文件名和空目录清理。
- `json.ts`：JSON 文件读写。
- `path.ts`：路径相对化、路径包含关系校验、路径分隔符归一化、后缀判断、`~` 展开和输入路径解析。

## 验证

```bash
pnpm --filter @tauri-vue-template/utils type-check
```
