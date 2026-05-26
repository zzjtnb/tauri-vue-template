# @tauri-vue-template/theme

共享视觉主题包，统一维护 workspace 应用复用的 CSS token、基础样式、动画、安全区样式和完整 UnoCSS 配置。

## Workspace 消费

本包只在 monorepo 内使用，不发布 npm。`exports` 指向 `src/`，应用 **dev / build** 直接消费源码，不依赖本包 `dist/`。

## 公共入口

应用 `uno.config.ts`：

```ts
import { createUnoConfig } from '@tauri-vue-template/theme/unocss'

export default createUnoConfig()
```

应用 `main.ts`：

```ts
import '@tauri-vue-template/theme/styles'
```

可选：从 `@tauri-vue-template/theme/unocss` 导入 `createUnoConfig`、`ThemeUnoConfigOptions` 等类型与工厂。

## 边界

- 本包只维护视觉主题和 UnoCSS 规则，不承载应用路由、状态、业务 API 或 Tauri 原生能力。
- `uno.config.ts` 必须从 `@tauri-vue-template/theme/unocss` 导入，**不要**从包根 `@tauri-vue-template/theme` 导入（根入口会加载 CSS，Node/jiti 无法处理）。
- 应用入口统一导入 `@tauri-vue-template/theme/styles`，避免多 app 维护重复样式文件。
- 本包可以依赖 UnoCSS、Iconify 工具和纯样式依赖；不能依赖具体 app。

## 验证

```bash
pnpm --filter @tauri-vue-template/theme type-check
pnpm --filter @tauri-vue-template/theme build
pnpm exec stylelint "packages/theme/**/*.{css,scss,vue,html}" --config stylelint.config.ts --fix --cache --cache-location node_modules/.cache/.stylelintcache
```

应用 `pnpm dev` 前无需执行本包 `build`。
