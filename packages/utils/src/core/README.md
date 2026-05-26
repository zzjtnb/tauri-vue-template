# @tauri-vue-template/utils/core

`core` 是跨运行时基础工具入口，只放纯 TypeScript 工具。

## 边界

- 可以被浏览器、Node CLI、Tauri 前端共同使用。
- 不依赖 `node:*`、Vue、Tauri API、UI 组件或业务模块。
- 新增导出必须先有清晰命名和 TSDoc，再从 `index.ts` 暴露。

## 当前能力

```ts
import { formatDuration, timestampSegment, toRequiredPositiveInt, toSafeFileSegment } from '@tauri-vue-template/utils/core'
```

- `number.ts`：数字归一化和正整数校验。
- `string.ts`：字符串转换，例如文件名片段安全化。
- `time.ts`：时间戳和耗时展示格式化。

## 验证

```bash
pnpm --filter @tauri-vue-template/utils type-check
```
