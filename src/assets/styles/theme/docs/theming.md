---
title: 主题配置
description: 项目主题 token、CSS 变量和 UnoCSS 映射规则。
---

## 概览

本项目使用 **UnoCSS Wind4 + CSS 变量**维护主题。组件、原子类和手写 CSS 都只消费语义 token，不直接写死具体颜色值。

```vue
<div class="bg-background text-foreground" />
<div class="bg-primary text-primary-foreground" />
<div class="bg-sidebar-primary text-sidebar-primary-foreground" />
```

## 事实来源

主题相关文件职责如下：

| 文件 | 职责 |
| --- | --- |
| `uno.config.ts` | 唯一 UnoCSS 配置入口；把 `bg-primary`、`text-sidebar-foreground` 等工具类映射到 CSS 变量。 |
| `src/main.ts` | 样式入口顺序控制；必须先导入 `uno.css`，再导入项目样式。 |
| `src/assets/styles/theme/index.css` | 主题样式入口；导入基础变量和每个主题 token 文件。 |
| `src/assets/styles/theme/variables.css` | 只放不适合由 Wind4 自动生成的项目基础变量，例如 `--radius`、`--un-default-border-color`。 |
| `src/assets/styles/theme/tokens/*.css` | 每个主题的明暗 token 值，是颜色值的真实维护位置。 |
| `src/assets/styles/index.css` | 全局样式入口；主题样式、基础样式、安全区、动画和第三方样式从这里接入。 |

`theme/index.css` 当前导入顺序：

```css
@import "./variables.css";
@import "./tokens/neutral.css" layer(theme);
@import "./tokens/blue.css" layer(theme);
@import "./tokens/violet.css" layer(theme);
@import "./tokens/teal.css" layer(theme);
@import "./tokens/rose.css" layer(theme);
@import "./tokens/amber.css" layer(theme);
```

颜色 token 文件进入 UnoCSS 的 `theme` layer。`variables.css` 自己声明 `@layer zzjtnb`，用于项目级基础变量和必要覆盖。

## Layer 与导入顺序

`uno.config.ts` 使用：

```ts
outputToCssLayers: {
  allLayers: true,
},
```

UnoCSS 会先声明 resolved layers 的默认顺序。当前已验证顺序为：

```txt
fonts → imports → properties → theme → base → preflights → icons → typography → shortcuts → default
```

因此 `src/main.ts` 必须保持这个顺序：

```ts
import 'uno.css'
import '@/assets/styles/index.css'
import 'vue-sonner/style.css'
import 'virtual:unocss-devtools'
```

`uno.css` 先建立 layer 顺序；项目样式只挂到已有 layer。不要在 `src/assets/styles/index.css` 里手写 `@layer fonts, properties, ...` 这类内部层级清单，避免和 UnoCSS 版本升级后的 resolved layers 漂移。

## UnoCSS 映射规则

`uno.config.ts` 中的 `theme.colors` 只引用 CSS 变量，不维护具体颜色值：

```ts
primary: {
  DEFAULT: 'var(--primary)',
  foreground: 'var(--primary-foreground)',
},
sidebar: {
  DEFAULT: 'var(--sidebar)',
  foreground: 'var(--sidebar-foreground)',
  primary: 'var(--sidebar-primary)',
  'primary-foreground': 'var(--sidebar-primary-foreground)',
},
warning: {
  DEFAULT: 'var(--warning)',
  foreground: 'var(--warning-foreground)',
},
```

因此：

| CSS 变量 | UnoCSS 工具类 |
| --- | --- |
| `--background` | `bg-background` |
| `--foreground` | `text-foreground` |
| `--primary` | `bg-primary` / `text-primary` / `border-primary` |
| `--primary-foreground` | `text-primary-foreground` |
| `--sidebar-primary` | `bg-sidebar-primary` / `text-sidebar-primary` |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` |
| `--warning` | `bg-warning` / `text-warning` / `border-warning` |
| `--warning-foreground` | `text-warning-foreground` |

具体颜色只改 `tokens/*.css`，不要在组件或 `uno.config.ts` 里写死颜色值。

## Token 配对规则

本项目所有实心语义背景都必须使用成对 foreground：

```vue
<!-- 正确 -->
<div class="bg-primary text-primary-foreground" />
<div class="bg-sidebar-primary text-sidebar-primary-foreground" />
<div class="bg-warning text-warning-foreground" />

<!-- 不推荐：实心语义背景不要使用普通 foreground -->
<div class="bg-primary text-foreground" />
<div class="bg-sidebar-primary text-sidebar-foreground" />
<div class="bg-warning text-warning" />
```

轻量背景可以使用半透明主色和主色文字：

```vue
<div class="bg-primary/10 text-primary" />
<div class="border-warning/20 bg-warning/10 text-warning" />
```

侧边栏内部的当前项和 CTA 使用侧边栏专用 token：

```vue
<div class="bg-sidebar-primary text-sidebar-primary-foreground" />
```

不要在侧边栏高亮里混用全局 `bg-primary text-primary-foreground`，避免导航壳层颜色污染内容区语义。

## 当前主题

| 主题 | 选择器 | 亮色主色 | 暗色主色 | 说明 |
| --- | --- | --- | --- | --- |
| Neutral | `:root`, `.neutral`, `.dark.neutral` | `oklch(55.4% 0.046 257.417deg)` | `oklch(70.8% 0 0deg)` | 默认低彩蓝灰主题。 |
| Blue | `.blue`, `.dark.blue` | `oklch(65% 0.18 255deg)` | `oklch(74% 0.14 255deg)` | 蓝色品牌主题。 |
| Violet | `.violet`, `.dark.violet` | `oklch(60% 0.22 295deg)` | `oklch(72% 0.17 295deg)` | 紫罗兰主题。 |
| Teal | `.teal`, `.dark.teal` | `oklch(70% 0.12 183deg)` | `oklch(74% 0.105 183deg)` | 青绿色主题。 |
| Rose | `.rose`, `.dark.rose` | `oklch(64% 0.22 16deg)` | `oklch(72% 0.16 16deg)` | 高识别度玫瑰主题。 |
| Amber | `.amber`, `.dark.amber` | `oklch(76% 0.16 70deg)` | `oklch(78% 0.14 70deg)` | 琥珀暖阳主题。 |

规则：

- 主色不能为了 foreground 对比度随意改暗；主题主色是主题识别来源。
- 亮色模式的实心高亮态统一使用浅色 foreground。
- 暗色模式的主色通常更亮，foreground 使用深色，形成“亮底深字”。
- Amber 的 `warning` 刻意偏橙铜，避免和琥珀主色混成同一种高亮。

## 主题运行时 class

主题切换由布局运行时集中处理。`src/components/layouts/composables/useRuntime.ts` 会把主题状态同步到 `document.documentElement`：

- `theme.mode` 控制 `.dark`：`dark` 强制暗色，`light` 移除暗色，`system` 跟随 `prefers-color-scheme`。
- `theme.color` 控制颜色类：`neutral`、`blue`、`violet`、`teal`、`rose`、`amber`。
- 切换颜色前会先移除所有已知主题色类，再添加当前颜色类，避免多个主题 token 同时生效。

默认主题状态定义在 `src/components/layouts/runtime/defaults.ts`：

```ts
theme: {
  mode: 'system',
  color: 'blue',
}
```

所以默认跟随系统明暗模式，颜色主题为 Blue。

## Token 分组

| Token | 控制内容 | 典型使用 |
| --- | --- | --- |
| `background` / `foreground` | 页面基础背景和默认文字。 | App 外壳、页面容器、普通正文。 |
| `card` / `card-foreground` | 卡片和面板表面。 | `Card`、设置面板、信息块。 |
| `popover` / `popover-foreground` | 浮层表面。 | `Popover`、`DropdownMenu`、`ContextMenu`。 |
| `primary` / `primary-foreground` | 全局主操作和内容区实心高亮。 | 默认按钮、选中状态、徽章、日历选中。 |
| `secondary` / `secondary-foreground` | 次级填充表面。 | 次级按钮、次级徽章。 |
| `muted` / `muted-foreground` | 弱化表面和低强调文字。 | 描述、占位符、空状态。 |
| `accent` / `accent-foreground` | 普通区域悬停和轻量选中。 | 幽灵按钮、菜单行 hover。 |
| `destructive` / `destructive-foreground` | 危险操作。 | 删除、错误、破坏性菜单项。 |
| `success` / `success-foreground` | 成功状态。 | 完成、成功提示、正向反馈。 |
| `warning` / `warning-foreground` | 警告状态。 | 风险提示、待处理、非破坏性注意事项。 |
| `border` | 默认边框。 | 卡片、表格、分隔线。 |
| `input` | 表单控件边框/输入相关表面。 | `Input`、`Textarea`、`Select`。 |
| `ring` | 默认聚焦环。 | 可聚焦控件。 |
| `chart-1` ... `chart-5` | 图表色板。 | 图表和数据可视化。 |
| `sidebar` / `sidebar-foreground` | 侧边栏基础表面和默认文字。 | `Sidebar` 容器。 |
| `sidebar-primary` / `sidebar-primary-foreground` | 侧边栏内实心高亮。 | 当前菜单项、侧边栏 CTA、账号图标块。 |
| `sidebar-accent` / `sidebar-accent-foreground` | 侧边栏悬停和轻量选中。 | 侧边栏菜单 hover、打开项。 |
| `sidebar-border` | 侧边栏边框。 | 侧边栏分隔线、分组边界。 |
| `sidebar-ring` | 侧边栏聚焦环。 | 侧边栏内可聚焦控件。 |

## 圆角尺度

`--radius` 是项目圆角唯一基准值，定义在 `variables.css`：

```css
@layer zzjtnb {
  :root,
  :host {
    --radius: 0.625rem;
  }
}
```

UnoCSS Wind4 的 radius key 从它派生：

```ts
radius: {
  xl: 'calc(var(--radius) + 4px)',
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
},
```

常用关系：

- `rounded-lg` → `var(--radius)`。
- `rounded-md` → `calc(var(--radius) - 2px)`。
- `rounded-sm` → `calc(var(--radius) - 4px)`。
- `rounded-xl` → `calc(var(--radius) + 4px)`。

不要在 token 文件里另建一套圆角变量；需要调整全局圆角时只改 `--radius`。

## 字体来源

字体变量由 `uno.config.ts` 的 `theme.font` 和 `presetWebFonts` 统一维护：

- `sans`：Nunito Sans + 系统无衬线兜底。
- `serif`：项目里的标题/展示字体语义，当前也使用 Nunito Sans + 系统兜底。
- `mono`：Fira Code + 系统等宽兜底。

`variables.css` 不手写 `--font-*`，避免和 Wind4 theme preflight 生成的字体变量出现两套来源。

## 添加新主题

新增主题时按以下步骤：

1. 在 `src/assets/styles/theme/tokens/` 下新增主题文件，例如 `green.css`。
2. 顶部注释写清楚亮色和暗色主色调。
3. 在亮色选择器和暗色选择器中声明完整 token：
   - shadcn-vue 兼容 token：`background`、`foreground`、`card`、`primary`、`sidebar-*` 等。
   - 项目自定义 token：`success`、`warning`。
4. 亮色实心高亮态使用浅色 foreground：
   - `--primary-foreground`
   - `--sidebar-primary-foreground`
5. 暗色主色如果是亮底，则 foreground 使用深色。
6. 确保 `warning` 不和主题主色撞色。
7. 在 `theme/index.css` 中导入：

```css
@import "./tokens/green.css" layer(theme);
```

不要在 `uno.config.ts` 中新增具体颜色值；`uno.config.ts` 只负责把 token 名映射到 CSS 变量。

## 添加新语义 Token

新增语义 token 时必须同时改三处：

1. 在每个 `tokens/*.css` 的明暗主题块里声明变量。
2. 在 `uno.config.ts` 的 `theme.colors` 中映射到 CSS 变量。
3. 在本文档的 Token 分组表里补用途和使用位置。

例如新增 `info`：

```css
.info-theme {
  --info: oklch(68% 0.14 240deg);
  --info-foreground: oklch(98% 0.008 240deg);
}
```

```ts
info: {
  DEFAULT: 'var(--info)',
  foreground: 'var(--info-foreground)',
},
```

组件中使用：

```vue
<div class="bg-info text-info-foreground" />
```

## 验证

主题改动后至少运行：

```bash
pnpm exec stylelint "src/assets/styles/theme/tokens/*.css" --config stylelint.config.js
pnpm exec vue-tsc --noEmit
```

需要确认 UnoCSS 工具类是否可生成时，可以用 `createGenerator` 做局部验证：

```bash
pnpm exec node --input-type=module -e "import config from './uno.config.ts'; import { createGenerator } from 'unocss'; const uno = await createGenerator(config); const result = await uno.generate('bg-primary text-primary-foreground bg-sidebar-primary text-sidebar-primary-foreground bg-warning text-warning-foreground', { preflights: false }); console.log([...result.matched].sort().join('|'));"
```

预期至少包含：

```txt
bg-primary
text-primary-foreground
bg-sidebar-primary
text-sidebar-primary-foreground
bg-warning
text-warning-foreground
```
