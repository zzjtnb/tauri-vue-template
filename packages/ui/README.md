# @tauri-vue-template/ui

`@tauri-vue-template/ui` 是当前工作区统一的 Vue 3 UI 入口，集中提供 shadcn-vue 基础组件、项目布局组件、`IconPicker` 和默认安装插件。

## Workspace 消费

本包只在 monorepo 内使用，不发布 npm。`exports` 指向 `src/index.ts`，应用 **dev / build** 由 Vite 直接打包源码，不依赖本包 `dist/`。

应用 `vite.config.ts` 需保留 `@ui/*` → `packages/ui/src/*` 的 alias（ui 包内部路径约定）。不要为 `@tauri-vue-template/ui` 配置指向 `dist` 的 alias。

## 特性

- 提供 `Button`、`Card`、`Dialog`、`Toaster` 等 shadcn-vue 组件。
- 提供 `AppLayout`、`LayoutRuntime` 等项目布局能力。
- 提供 `IconPicker`，用于选择 UnoCSS Iconify 图标类名。
- 提供默认 Vue 插件，可一次性注册可安装的 UI 组件。
- 支持按需命名导入，便于构建工具做 tree-shaking。

## 使用方式

```ts
import Ui, {
  AppLayout,
  Button,
  IconPicker,
  LayoutRuntime,
  Toaster,
  type LayoutRouteModule,
} from '@tauri-vue-template/ui'
```

## 安装插件

```ts
import { createApp } from 'vue'
import Ui from '@tauri-vue-template/ui'

createApp(App).use(Ui)
```

`app.use(Ui)` 只负责注册 UI 组件。路由、状态、主题、全局样式和图标预设仍由应用入口自行维护。

## 按需导入

只使用部分组件时，直接从包根按需导入：

```vue
<script setup lang="ts">
import { Button, Card, CardContent, CardHeader, CardTitle } from '@tauri-vue-template/ui'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>设置</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>保存</Button>
    </CardContent>
  </Card>
</template>
```

## IconPicker

`IconPicker` 用于选择并保存 UnoCSS 图标类名，例如 `i-lucide-settings`。

```vue
<script setup lang="ts">
import { IconPicker } from '@tauri-vue-template/ui'

const icon = defineModel<string>()
</script>

<template>
  <IconPicker v-model="icon" />
</template>
```

需要切换图标集合时传入 Iconify 兼容配置：

```ts
import type { IconCollection } from '@tauri-vue-template/ui'

const collection: IconCollection = {
  apiBase: 'https://api.iconify.design',
  name: 'Lucide',
  prefix: 'lucide',
}
```

`apiBase` 是安全边界：组件会从该服务加载 SVG 文本用于预览，只应配置可信的 Iconify 兼容服务。

## 布局

```ts
import {
  AppLayout,
  LayoutRuntime,
  type LayoutRouteModule,
} from '@tauri-vue-template/ui'
```

`AppLayout` 用于渲染项目布局外壳；`LayoutRuntime` 提供布局运行时能力；`LayoutRouteModule` 用于标注布局路由模块数组。

## 样式

组件依赖当前工作区的 UnoCSS 配置、主题 token 和全局样式。UI 插件不会自动注入 reset、主题、图标预设或远程字体配置。

## 验证

```bash
pnpm --filter @tauri-vue-template/ui type-check
pnpm --filter @tauri-vue-template/ui build
```

应用 `pnpm dev` 前无需执行本包 `build`。
