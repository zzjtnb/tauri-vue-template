# shadcn-vue 内部工作区

这里是 `@tauri-vue-template/ui` 内部的 shadcn-vue 官方脚手架目录，不是业务应用的公开依赖入口。

## 使用边界

业务代码只从 UI 包根导入：

```ts
import { Button, Card, cn } from '@tauri-vue-template/ui'
```

业务应用不需要感知本目录；所有组件由 `@tauri-vue-template/ui` 包根统一导出。

## 目录职责（相对 `packages/ui` 包根）

- `components.json`：`packages/ui/components.json`，shadcn-vue 官方 CLI 配置（别名 `@ui/shadcn-vue/*`）。
- `scripts/shadcn-vue-cli.sh`：`packages/ui/scripts/shadcn-vue-cli.sh`，在包根执行官方 CLI。
- `src/shadcn-vue/index.ts`：内部 facade，供 `packages/ui/src/index.ts` 转发 `cn` 与全部 shadcn 组件。
- `src/shadcn-vue/lib`、`src/shadcn-vue/ui`：官方脚手架生成/维护，不做业务化手改。

## shadcn-vue CLI

新增或更新组件时从仓库根执行：

```bash
pnpm --filter @tauri-vue-template/ui shadcn-vue
```

脚本在 `packages/ui` 包根运行，生成结果写入 `src/shadcn-vue/`。

## 验证

```bash
pnpm --filter @tauri-vue-template/ui type-check
pnpm exec eslint packages/ui/src/shadcn-vue --fix --cache --cache-location node_modules/.cache/.eslintcache --config eslint.config.ts
pnpm exec stylelint "packages/ui/src/shadcn-vue/**/*.{css,scss,vue,html}" --config stylelint.config.ts --fix --cache --cache-location node_modules/.cache/.stylelintcache
```
