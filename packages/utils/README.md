# @tauri-vue-template/utils

模板内共享的框架无关工具包。这个包提供浏览器安全的纯 TypeScript 工具、通用 HTTP client，以及显式 Node 子路径工具；不依赖 Vue、UI 组件、路由、Pinia、Tauri 或具体业务 API。

## Workspace 消费

本包只在 monorepo 内使用，不发布 npm。`package.json` 的 `exports` 指向 `src/`，应用与 CLI 在 **dev / build** 时直接解析源码，**不需要**先执行本包 `build` 生成 `dist`。

`dist/` 仅在本包执行 `pnpm build` 时产出，用于包级校验或后续工具链，不是应用 dev 的前置条件。

## 公共入口

从包根导入浏览器安全工具：

```ts
import { HttpClient, request, toOptionalPositiveInt } from '@tauri-vue-template/utils'
```

也可以按功能子路径导入：

```ts
import { toRequiredPositiveInt } from '@tauri-vue-template/utils/core'
import { HttpClient } from '@tauri-vue-template/utils/http'
import { readJson } from '@tauri-vue-template/utils/node'
```

当前稳定导出：

- `.`：浏览器安全入口，导出 `core` 和 `http` 的公共 API，不导出 Node-only 工具。
- `./core`：导出跨运行时纯 TypeScript 基础工具。
- `./http`：导出基于原生 `fetch` 的 HTTP client、错误类型、拦截器和公共类型。
- `./node`：Node-only 工具聚合入口，仅供 CLI、脚本和构建工具使用。

## 边界

- 本包不依赖 Vue、shadcn-vue、layouts、desktop app 或 Tauri API。
- 包根 `.` 必须保持浏览器安全，禁止导出 `node:*` 相关能力。
- Node-only 工具只能从 `./node` 显式导入；`package.json` 当前不暴露 `./node/*` 内部文件。
- 本包不处理业务响应协议，例如 `{ code, data, message }`；业务 API 层自行解释。
- 新增工具必须先进入 `src/core`、`src/http`、`src/node` 等明确功能目录，再从该目录 `index.ts` 导出稳定入口。
- 每个功能目录必须维护 `index.ts`、`types.ts` 和 `README.md`；公开函数和类型必须写 TSDoc。
- 内部实现文件不是公共契约，使用者应通过包根或 `exports` 声明的子路径导入。

## HTTP client 文档

HTTP client 的详细用法见：

```txt
src/http/README.md
```

## 验证

```bash
pnpm --filter @tauri-vue-template/utils type-check
pnpm --filter @tauri-vue-template/utils build
```

应用侧无需先执行上述 `build` 再 `pnpm dev`。
