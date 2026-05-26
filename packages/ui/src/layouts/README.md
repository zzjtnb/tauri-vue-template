# Vue App Layouts

面向 Vue 应用的路由驱动布局库。它把应用壳、导航菜单、面包屑、页签、设置面板、移动端侧边栏和内容出口统一收敛到 `AppLayout`，业务页面只需要通过路由 `meta` 描述自己需要哪种布局。

本文说明布局能力的使用方式；示例统一从 `@tauri-vue-template/ui` 导入。

## 适用场景

- 中后台、工作台、文档后台、跨端管理端等需要稳定应用壳的 Vue 项目。
- 路由表已经是页面结构事实来源，希望菜单、面包屑、页签都从路由派生。
- 页面需要在标准布局、空白布局、整页工作台、iframe 页面之间切换。
- 宿主希望用自己的状态容器或路由模块接入布局系统，但不希望布局库依赖业务 Store。

## 能力概览

- `topnav`、`sidebar`、`hybrid`、`blank` 四种布局。
- `header`、`sidebar`、`content`、`footer` 四个大区和稳定子区。
- 区域预设、`route.meta.layout` 组件、路由命名视图、显式 slots 和 addons 共同定制区域。
- 根据 Vue Router 路由树生成导航菜单、面包屑、固定页签和已访问页签。
- `RouterView`、`KeepAlive`、iframe 内容出口和整页接管内容区。
- 内置布局设置面板：主题、布局模式、菜单展开方式、页面元素开关。
- 移动端侧边栏自动隐藏，桌面端侧边栏支持 rail 折叠和拖拽宽度。
- 类型入口统一收敛到 `Layout`，运行时入口统一收敛到 `LayoutRuntime`。

## 安装

本仓库只在 monorepo 内使用，不发布 npm。在应用 `package.json` 中声明：

```json
"@tauri-vue-template/ui": "workspace:*"
```

应用通过包名导入（dev / build 均解析到 `packages/ui` 源码，不依赖 `dist`）：

```ts
import { AppLayout, LayoutRuntime, LayoutSettings, LayoutSettingsTrigger } from '@tauri-vue-template/ui'
import type { Layout, LayoutRouteModule, LayoutRouteRecord } from '@tauri-vue-template/ui'
```

## 环境要求

当前源码按以下依赖形态实现：

| 依赖 | 要求 |
| --- | --- |
| Vue | Vue 3，使用 Composition API 和 `<script setup lang="ts">` |
| Vue Router | 使用 `createRouter`、`RouterView`、命名视图、`route.meta`、`route.matched` 等 API |
| TypeScript | 推荐开启严格类型检查，公共类型通过 `Layout[...]` 对象路径读取 |
| 样式 | 组件模板使用语义 CSS token 和 utility class，发布包应同时提供对应样式 |

## 快速开始

最小接入只需要把 `AppLayout` 放进根路由，业务页面继续写在 `children` 里。

```ts
import { AppLayout } from '@tauri-vue-template/ui'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      component: AppLayout,
      redirect: { name: 'home' },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('./pages/HomePage.vue'),
          meta: {
            title: '首页',
            icon: 'i-lucide-home',
            layout: 'sidebar',
            affix: true,
          },
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('./pages/LoginPage.vue'),
          meta: {
            title: '登录',
            layout: 'blank',
            hidden: true,
          },
        },
      ],
    },
  ],
})
```

应用入口正常安装路由：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App)
  .use(router)
  .mount('#app')
```

根组件可以保持很薄：

```vue
<template>
  <RouterView />
</template>
```

## 使用路由模块生成根布局

如果路由按模块导出，推荐用 `LayoutRuntime.defineRoutes()` 生成根布局路由。

```ts
import { LayoutRuntime } from '@tauri-vue-template/ui'
import * as routeModules from './modules'

export const routes = LayoutRuntime.defineRoutes({
  modules: routeModules,
  root: {
    redirect: { name: 'home' },
  },
})
```

默认规则：

- `publicRouteKeys` 默认是 `['publicRoutes']`，这些导出的路由会放在 `AppLayout` 外面。
- `routeExportSuffix` 默认是 `'Routes'`，其他以 `Routes` 结尾的数组会进入根布局 `children`。
- 根路由默认是 `{ path: '/', name: 'root' }`。
- 根路由的 `component` 固定为 `AppLayout`，`children` 固定为收集到的业务路由。

如果希望所有本地路由都进入 `AppLayout`，包括 `meta.layout = 'blank'` 的公共页，可以显式清空公共路由白名单：

```ts
export const routes = LayoutRuntime.defineRoutes({
  modules: routeModules,
  publicRouteKeys: [],
  root: {
    redirect: { name: 'home' },
  },
})
```

## 布局声明

页面通过 `route.meta.layout` 声明布局。未声明时默认使用 `topnav`。

```ts
meta: {
  title: '仪表盘',
  layout: 'hybrid',
}
```

| 布局名 | 说明 |
| --- | --- |
| `topnav` | 顶部导航布局。移动端会通过侧边栏承接导航入口。 |
| `sidebar` | 侧边导航布局。桌面端可折叠为 rail 或隐藏。 |
| `hybrid` | 顶部导航和侧边导航同时存在。 |
| `blank` | 空白布局，只渲染内容区，适合登录页、错误页、嵌入文档。 |

复杂页面可以声明完整 layout 对象：

```ts
import type { Layout } from '@tauri-vue-template/ui'

const workspaceLayout = {
  name: 'hybrid',
  fixed: true,
  header: {
    center: false,
    right: {
      component: () => import('./layout/HeaderActions.vue'),
      label: '工作台操作区',
    },
  },
  sidebar: {
    content: {
      component: () => import('./layout/WorkspaceMenu.vue'),
      label: '工作台菜单',
    },
  },
  footer: {
    right: {
      component: () => import('./layout/FooterStatus.vue'),
      label: '运行状态',
    },
  },
} satisfies Layout['Config']
```

```ts
{
  path: 'workspace',
  component: () => import('./pages/WorkspacePage.vue'),
  meta: {
    title: '工作台',
    layout: workspaceLayout,
  },
}
```

`topnav`、`sidebar`、`hybrid` 默认属于可跟随设置的标准布局：当设置面板选择普通页面布局模式时，运行时会覆盖非 fixed 路由的布局名称，但保留该路由对象里的区域声明。需要工作台、画布或强定制页面始终保持自己的壳时，在 `layout` 对象里写 `fixed: true`；`blank` 默认固定，不需要重复声明。只有完整 layout 对象显式写 `{ name: 'blank', fixed: false }` 时，才会允许用户布局偏好覆盖它。

## 路由 Meta 字段

布局库只消费展示、导航、布局和内容出口相关字段。鉴权字段应该由宿主项目自己的路由类型和守卫处理。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 菜单、面包屑、页签和默认页面标题。 |
| `icon` | `string` | 菜单图标 class，例如 Iconify 或 UnoCSS 图标类。 |
| `order` | `number` | 菜单、固定页签排序，默认 `999`。 |
| `hidden` | `boolean` | 从菜单、固定页签候选和已访问页签中隐藏；隐藏父级也会阻断其子级菜单。面包屑由 `breadcrumb: false` 单独控制。 |
| `alwaysShow` | `boolean` | 父级只有一个可展示子项时仍显示父级菜单。 |
| `hideChildrenInMenu` | `boolean` | 菜单中隐藏子级，只显示当前父级项。 |
| `layout` | `Layout['Declaration']` | 布局名称或完整布局对象。 |
| `externalLink` | `string` | 菜单点击打开外部地址。 |
| `menuTarget` | `'_blank'` | 菜单用新窗口打开。 |
| `breadcrumb` | `boolean` | `false` 时排除当前级面包屑。 |
| `affix` | `boolean` | 固定页签，首次访问前也会显示。 |
| `keepAlive` | `boolean` | 需要缓存页面组件。 |
| `cacheKey` | `string` | 自定义 `KeepAlive` 渲染 key，适合参数页共享缓存。 |
| `iframeSrc` | `string` | 内容区渲染 iframe，优先于普通 `RouterView`。 |
| `iframeSandbox` | `string` | iframe `sandbox`。 |
| `iframeReferrerPolicy` | `Layout['Route']['IframeReferrerPolicy']` | iframe `referrerpolicy`。 |
| `iframeAllow` | `string` | iframe `allow`。 |

`fixed` 不是顶层 route meta 字段，只能写在 `meta.layout` 对象内。这样布局名称、区域声明、设置入口和固定策略都收敛在同一个 layout 配置入口里。

## 区域系统

布局由四个大区组成：

| 大区 | 子区 |
| --- | --- |
| `header` | `left`、`brand`、`center`、`right` |
| `sidebar` | `header`、`content`、`footer` |
| `content` | `before`、主内容区、`after` |
| `footer` | `left`、`center`、`right` |

每个区域声明可以写模式值或配置对象。

```ts
type Mode = Layout['Area']['Mode']
// false | 'default' | 'custom' | 'auto'
```

| 模式 | 行为 |
| --- | --- |
| `false` | 禁用区域，slot、命名视图和配置组件都不会重新打开它。 |
| `'default'` | 使用默认区域内容。 |
| `'custom'` | 不回退默认内容；缺少 slot、命名视图、配置组件和 addon 时会在开发环境警告。 |
| `'auto'` | 有主体自定义来源或 addon 时渲染，否则按该区域的默认策略处理。 |

区域配置对象：

```ts
const headerRight = {
  mode: 'auto',
  component: () => import('./layout/HeaderActions.vue'),
  class: 'gap-2',
  label: '顶部栏操作区',
  addons: {
    after: {
      component: () => import('./layout/StatusDot.vue'),
      props: { kind: 'online' },
      label: '在线状态',
    },
  },
} satisfies Layout['Area']['Config']
```

复合区域可以使用 `all` 批量配置全部子区，再用具体子区覆盖：

```ts
const layout = {
  name: 'hybrid',
  settings: false,
  header: {
    all: {
      component: () => import('./layout/RegionCard.vue'),
    },
    right: {
      component: () => import('./layout/HeaderActions.vue'),
      label: '操作区',
    },
  },
  sidebar: {
    all: {
      component: () => import('./layout/SidebarPanel.vue'),
    },
    content: {
      component: () => import('./layout/SidebarNavigation.vue'),
    },
  },
} satisfies Layout['Config']
```

`layout.settings` 用来控制默认设置入口。标准布局默认会把设置按钮作为 addon 放在 `header.right` 后侧；`settings: false` 会关闭这个默认入口；传入字符串会保留入口并跳转到调用方声明的路由。设置入口组件本身也可以作为任意区域 addon 使用，并通过 props 复用同样的 `to` 配置；需要更多触发器参数时仍可写对象形式。示例页保持默认内置面板或隐藏入口，不绑定具体业务设置页。

## 自定义区域组件

自定义区域组件只接收一个 prop：`context`。

```vue
<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'

defineProps<Layout['Area']['Props']>()
</script>

<template>
  <button type="button" @click="context.sidebar.toggle">
    切换侧边栏
  </button>
</template>
```

常用上下文：

| 字段 | 说明 |
| --- | --- |
| `context.area` | 当前区域信息，包含 `name`、`label`、`mode`、`region`、`part`。 |
| `context.layout.name` | 当前布局名称。 |
| `context.layout.declaration` | 完整解析后的布局声明。 |
| `context.route` | 当前 Vue Router 路由。 |
| `context.viewport.mobile` | 当前是否是移动端视口。 |
| `context.sidebar.mode` | 当前侧边栏运行态：`expanded`、`collapsed`、`hidden`。 |
| `context.sidebar.toggle()` | 移动端在显示和隐藏之间切换，桌面端在展开和折叠之间切换。 |
| `context.sidebar.close()` | 隐藏侧边栏。 |
| `context.sidebar.expand()` | 展开侧边栏。 |
| `context.sidebar.collapse()` | 折叠侧边栏。 |
| `context.settings.open` | 设置面板是否打开。 |
| `context.settings.show()` | 打开设置面板。 |
| `context.settings.hide()` | 关闭设置面板。 |
| `context.settings.toggle()` | 切换设置面板。 |

## 区域来源优先级

同一个区域最终按以下来源渲染：

```txt
区域预设 < route.meta.layout 局部声明 < 路由命名视图 < AppLayout 显式 slot
```

区域内部内容顺序固定为：

```txt
addons.before -> 主体内容 -> addons.after
```

主体内容来源优先级固定为：

```txt
显式 slot -> 路由命名视图 -> layout 配置组件 -> 默认内容
```

### 区域预设

区域预设适合跨页面复用一组 `settings/header/sidebar/content/footer` 配置。预设放在 `Layout['Context'].areas` 中，再由路由 `layout.areas` 引用。预设不承载 `name`、`areas` 和 `fixed`；布局名称和固定策略必须由当前路由的 `meta.layout` 声明。

```ts
import { reactive } from 'vue'
import { LayoutRuntime } from '@tauri-vue-template/ui'
import type { Layout } from '@tauri-vue-template/ui'

const settings = reactive<Layout['State']>(
  structuredClone(LayoutRuntime.defaultState),
)

const context = {
  routes,
  settings,
  areas: {
    workspace: {
      header: {
        right: {
          component: () => import('./layout/HeaderActions.vue'),
          label: '工作台操作区',
        },
      },
      sidebar: {
        content: {
          component: () => import('./layout/WorkspaceMenu.vue'),
          label: '工作台菜单',
        },
      },
    },
  },
} satisfies Layout['Context']

LayoutRuntime.context.set(context)
```

路由中引用：

```ts
meta: {
  title: '工作台',
  layout: {
    name: 'hybrid',
    areas: 'workspace',
  },
}
```

多个预设按数组顺序合并，后者覆盖前者：

```ts
layout: {
  name: 'hybrid',
  areas: ['workspace', 'toolbar'],
}
```

### 路由命名视图

命名视图适合路由局部定制，使用 Vue Router 原生 `components` 选项。

```ts
{
  path: 'workspace',
  components: {
    default: () => import('./pages/WorkspacePage.vue'),
    'layout-header-brand': () => import('./layout/HeaderBrand.vue'),
    'layout-header-right': () => import('./layout/HeaderActions.vue'),
    'layout-sidebar-content': () => import('./layout/WorkspaceMenu.vue'),
    'layout-content-before': () => import('./layout/Toolbar.vue'),
    'layout-footer-right': () => import('./layout/FooterStatus.vue'),
  },
  meta: {
    title: '工作台',
    layout: 'hybrid',
  },
}
```

支持的命名视图：

| 命名视图 | 对应区域 |
| --- | --- |
| `layout-header` | 完整顶部栏 |
| `layout-header-left` | 顶部栏起始区 |
| `layout-header-brand` | 顶部栏品牌区 |
| `layout-header-center` | 顶部栏导航区 |
| `layout-header-right` | 顶部栏操作区 |
| `layout-sidebar` | 完整侧边栏 |
| `layout-sidebar-header` | 侧边栏头部 |
| `layout-sidebar-content` | 侧边栏内容 |
| `layout-sidebar-footer` | 侧边栏底部 |
| `layout-content` | 主内容区 |
| `layout-content-before` | 内容前置区 |
| `layout-content-after` | 内容后置区 |
| `layout-footer` | 完整底部栏 |
| `layout-footer-left` | 底部栏左区 |
| `layout-footer-center` | 底部栏中区 |
| `layout-footer-right` | 底部栏右区 |

### 显式 Slots

显式 slots 适合包装 `AppLayout`，也是区域来源最高优先级。

```vue
<script setup lang="ts">
import { AppLayout } from '@tauri-vue-template/ui'
import type { Layout } from '@tauri-vue-template/ui'

defineProps<{
  context: Layout['Context']
}>()
</script>

<template>
  <AppLayout :context="context">
    <template #header-right="{ context: areaContext }">
      <button type="button" @click="areaContext.settings.show">
        设置
      </button>
    </template>

    <template #default="{ context: areaContext }">
      <section>
        当前布局：{{ areaContext.layout.name }}
      </section>
    </template>
  </AppLayout>
</template>
```

支持的 slots：

```txt
default
header
header-left
header-brand
header-center
header-right
sidebar
sidebar-header
sidebar-content
sidebar-footer
content-before
content-after
footer
footer-left
footer-center
footer-right
```

所有 slot props 都是 `{ context: Layout['Area']['Context'] }`。

## 整页接管内容区

默认内容区会包一层带 padding 的 `<section>`，里面渲染 `RouterView` 或 iframe。全屏工作台、设置页、画布页如果要直接接管主内容区，使用 `LayoutRuntime.defineContent()`。

```ts
import { LayoutRuntime } from '@tauri-vue-template/ui'

{
  path: 'settings',
  name: 'settings',
  components: LayoutRuntime.defineContent(
    () => import('./pages/SettingsPage.vue'),
  ),
  meta: {
    title: '设置',
    layout: 'hybrid',
  },
}
```

这个 helper 会生成：

```ts
{
  default: component,
  'layout-content': component,
}
```

这样页面既能完整接管 `layout-content`，又不需要手写命名视图字符串。

## iframe 内容页

路由设置 `iframeSrc` 后，内容区会渲染 iframe，不再渲染普通 `RouterView`。

```ts
{
  path: 'docs',
  name: 'docs',
  component: () => import('./pages/EmptyPage.vue'),
  meta: {
    title: '文档',
    icon: 'i-lucide-book-open',
    layout: 'hybrid',
    iframeSrc: 'https://example.com/docs',
    iframeSandbox: 'allow-scripts allow-forms allow-popups',
    iframeReferrerPolicy: 'strict-origin-when-cross-origin',
    iframeAllow: 'fullscreen',
  },
}
```

`component` 仍建议保留一个轻量页面组件，方便路由工具和类型约束保持一致；真正内容由 iframe 接管。

## Context

`Layout['Context']` 是布局库唯一外部依赖入口。

```ts
type ContextShape = {
  routes: MaybeRefOrGetter<RouteRecordRaw[]>
  settings: Layout['State']
  areas?: Record<string, Layout['Area']['Preset']>
  tabs?: Layout['Tabs']['Context']
}
```

上下文来源优先级：

```txt
AppLayout props.context -> LayoutRuntime.create({ context }) / LayoutRuntime.context.set(context) -> 内置 context
```

内置 context 会提供：

- 内置响应式 `settings`。
- 内置已访问页签状态。
- 调用方传入或路由器当前 options 中的 routes。
- 只持久化 `preferences`，不持久化 `ui` 运行态。

### 全局设置 Context

```ts
import { LayoutRuntime } from '@tauri-vue-template/ui'

const baseContext = LayoutRuntime.context.get(routes)

LayoutRuntime.context.set({
  ...baseContext,
  routes,
  areas,
})
```

也可以通过 Vue 插件安装时设置。插件只在安装阶段读取一次 `context`。

```ts
app.use(LayoutRuntime.create({
  context,
}))
```

### 组件内读取 Context

```ts
import { LayoutRuntime } from '@tauri-vue-template/ui'

const context = LayoutRuntime.context.use()
```

`context.use()` 会优先读取组件树里的布局上下文；没有 provider 时回退到默认 context。

## 状态

布局状态分成可持久化偏好和不持久化运行态。

```ts
import { reactive } from 'vue'
import { LayoutRuntime } from '@tauri-vue-template/ui'
import type { Layout } from '@tauri-vue-template/ui'

const state = reactive<Layout['State']>(
  structuredClone(LayoutRuntime.defaultState),
)
```

不要直接修改 `LayoutRuntime.defaultState`。它是库级只读默认值，需要先 `structuredClone`。

默认状态：

```ts
const state = {
  preferences: {
    theme: {
      mode: 'system',
      color: 'blue',
    },
    layoutMode: null,
    navigation: {
      sidebar: {
        collapseMode: 'auto',
        menuMode: 'collapse',
      },
      topnav: {
        menuMode: 'collapse',
      },
    },
    pageElements: {
      tabs: true,
      breadcrumb: true,
      headerFixed: true,
      footerFixed: false,
    },
  },
  ui: {
    settings: {
      open: false,
    },
    sidebar: {
      mode: 'expanded',
    },
  },
} satisfies Layout['State']
```

`preferences.layoutMode` 只覆盖未固定的标准布局页面。路由可以声明字符串 layout 或完整 layout 对象；只要没有 `fixed: true`，且最终布局不是默认固定的 `blank`，设置面板里的普通页面布局模式就能覆盖布局名称。字符串 `blank` 和未声明 `fixed` 的 blank 对象默认固定；只有完整对象显式写 `{ name: 'blank', fixed: false }` 时才会被布局偏好覆盖。

## 设置页复用

`LayoutSettings` 是设置面板内容组件，适合嵌入项目自己的设置页。

```vue
<script setup lang="ts">
import { LayoutRuntime, LayoutSettings } from '@tauri-vue-template/ui'

const layoutContext = LayoutRuntime.context.use()
const state = layoutContext.settings
</script>

<template>
  <LayoutSettings :state="state" flush />
</template>
```

`LayoutSettings` 接收：

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `state` | `Layout['State']` | 必填，布局状态对象。 |
| `showClose` | `boolean` | 显示底部关闭按钮。 |
| `flush` | `boolean` | 去掉默认边距，适合嵌入已有卡片。 |
| `compact` | `boolean` | 紧凑布局，适合抽屉或窄面板。 |

事件：

| 事件 | 说明 |
| --- | --- |
| `close` | 点击关闭按钮时触发。 |

`AppLayout` 内部自带设置对话框。标准布局默认会在顶部栏右侧显示设置入口。`layout.settings` 可以关闭默认入口；业务路由如果需要跳转自己的设置页，可以传入自己的目标路径，但示例页不绑定具体业务入口：

```ts
meta: {
  layout: {
    name: 'hybrid',
    settings: false,
  },
}
```

## 页签和 KeepAlive

内置页签会在路由变化时调用 `addRouteView(route)`，并忽略以下路由：

- 路径以 `/redirect` 开头。
- `meta.hidden` 为 `true`。
- 没有 `meta.title`。

页签去重键使用导航归一化路径，参数页不会无限新增页签。`keepAlive` 路由会把 `fullPath` 写入缓存列表。

需要接入外部 Store 时传入 `Layout['Tabs']['Context']`：

```ts
import type { Layout } from '@tauri-vue-template/ui'

const tabs = {
  visibleViews,
  cachedViews,
  cachedViewSet,
  addRouteView(route) {
    tabsStore.add(route)
  },
  delView(view) {
    tabsStore.remove(view)
  },
  delOtherViews(view) {
    tabsStore.removeOthers(view)
  },
  delLeftViews(view) {
    tabsStore.removeLeft(view)
  },
  delRightViews(view) {
    tabsStore.removeRight(view)
  },
  delAllViews() {
    tabsStore.clear()
  },
  updateVisitedView(view) {
    tabsStore.update(view)
  },
} satisfies Layout['Tabs']['Context']
```

清理内置页签：

```ts
import { LayoutRuntime } from '@tauri-vue-template/ui'

LayoutRuntime.tabs.clear()
```

如果传入自定义 `tabs`，清理、缓存列表和删除策略由外部 Store 自己维护。

## 导航菜单

菜单从 `context.routes` 递归派生：

- 没有 `title` 的中间路由不会显示，但可展示子路由会上浮。
- `hidden` 路由不会进入菜单，隐藏父级也会阻断其子级菜单。
- 子路由 path 会归一化为可导航绝对路径。
- 可选参数路径会归一化，例如 `/chat/:sessionId?` 的菜单路径是 `/chat`。
- 父级只有一个可展示子项时，默认提升子项；`alwaysShow: true` 可以保留父级。
- `hideChildrenInMenu: true` 会隐藏子级菜单。
- `externalLink` 或 `menuTarget: '_blank'` 会渲染为 `<a>`。

## 公开导出

| 导出 | 说明 |
| --- | --- |
| `AppLayout` | 根布局组件。 |
| `LayoutSettings` | 设置内容组件，可嵌入设置页。 |
| `LayoutSettingsTrigger` | 设置入口组件，可作为任意区域 addon 复用；默认打开内置面板，传入 `to` 时跳转调用方声明的路由。 |
| `LayoutRuntime` | 运行时 API。 |
| `Layout` | 类型根入口，只通过 `import type` 使用。 |
| `LayoutRouteRecord` | 单条布局路由记录类型，等价于 `Layout['Route']['RecordRaw']`。 |
| `LayoutRouteModule` | 路由模块数组类型，用于 `export const xxxRoutes: LayoutRouteModule = [...]`。 |

`LayoutRuntime`：

| API | 说明 |
| --- | --- |
| `LayoutRuntime.create(options)` | 创建 Vue 插件，用于安装全局 context。 |
| `LayoutRuntime.defineRoutes(options)` | 根据路由模块生成带 `AppLayout` 壳的路由树。 |
| `LayoutRuntime.defineContent(component)` | 生成 `default` 和 `layout-content` 命名视图映射。 |
| `LayoutRuntime.defaultState` | 只读默认状态，使用前需要 `structuredClone`。 |
| `LayoutRuntime.context.get(routes?)` | 获取默认 context。 |
| `LayoutRuntime.context.use(routes?)` | 在组件 setup 中读取最近 context，没有时回退默认 context。 |
| `LayoutRuntime.context.set(context)` | 设置全局默认 context。 |
| `LayoutRuntime.tabs.clear()` | 清理内置已访问页签和缓存列表。 |

常用类型路径：

| 类型路径 | 说明 |
| --- | --- |
| `Layout['Name']` | `topnav`、`sidebar`、`hybrid`、`blank`。 |
| `Layout['StandardName']` | 可被用户偏好覆盖的标准布局名，不含 `blank`。 |
| `Layout['Declaration']` | `route.meta.layout` 的入口类型。 |
| `Layout['Config']` | 完整 layout 对象。 |
| `Layout['Context']` | 布局上下文。 |
| `Layout['State']` | 完整布局状态。 |
| `Layout['Preferences']` | 可持久化偏好。 |
| `Layout['UiState']` | 不持久化运行态。 |
| `Layout['Area']['Props']` | 自定义区域组件 props。 |
| `Layout['Area']['Context']` | 自定义区域组件和 slots 收到的上下文。 |
| `Layout['Area']['Config']` | 单个区域配置对象。 |
| `Layout['Area']['Preset']` | 区域预设，只承载 `settings/header/sidebar/content/footer`，不承载布局名称、预设引用链和固定策略。 |
| `Layout['Area']['Addon']` | 单个 addon 配置。 |
| `Layout['Route']['Meta']` | 布局路由 meta 字段。 |
| `Layout['Route']['RecordRaw']` | 绑定布局 meta 的路由记录。入口也导出了短类型 `LayoutRouteRecord`。 |
| `Layout['Tabs']['Context']` | 外部页签适配器。 |
| `Layout['Tabs']['Visited']` | 已访问页签记录。 |
| `Layout['Menu']['Item']` | 导航菜单项。 |

## 完整接入示例

下面示例展示路由模块、区域预设、设置状态和 context 一起接入。

```ts
// router/routes.ts
import { LayoutRuntime } from '@tauri-vue-template/ui'
import * as modules from './modules'

export const routes = LayoutRuntime.defineRoutes({
  modules,
  publicRouteKeys: [],
  root: {
    redirect: { name: 'home' },
  },
})
```

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { LayoutRuntime } from '@tauri-vue-template/ui'
import type { Layout } from '@tauri-vue-template/ui'
import { routes } from './routes'

const areaPresets = {
  workspace: {
    header: {
      right: {
        component: () => import('../layout/HeaderActions.vue'),
        label: '工作台操作区',
      },
    },
    sidebar: {
      content: {
        component: () => import('../layout/WorkspaceMenu.vue'),
        label: '工作台菜单',
      },
      footer: {
        component: () => import('../layout/SidebarFootnote.vue'),
        label: '侧边栏底部',
      },
    },
  },
} satisfies Record<string, Layout['Area']['Preset']>

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

const layoutRoutes = [...router.options.routes]
const defaultContext = LayoutRuntime.context.get(layoutRoutes)

LayoutRuntime.context.set({
  ...defaultContext,
  routes: layoutRoutes,
  areas: areaPresets,
})
```

```ts
// router/modules/workspace.ts
import type { LayoutRouteModule } from '@tauri-vue-template/ui'

export const workspaceRoutes: LayoutRouteModule = [
  {
    path: 'workspace',
    name: 'workspace',
    component: () => import('../../pages/WorkspacePage.vue'),
    meta: {
      title: '工作台',
      icon: 'i-lucide-layout-dashboard',
      order: 10,
      affix: true,
      layout: {
        name: 'hybrid',
        areas: 'workspace',
        fixed: true,
        footer: {
          right: {
            component: () => import('../../layout/FooterStatus.vue'),
            label: '运行状态',
          },
        },
      },
    },
  },
]
```

## 故障排查

### 自定义区域没有渲染

检查：

- 区域没有被设置为 `false`。
- 配置组件写在 `{ component }` 中，而不是直接把组件函数赋给子区。
- 命名视图名称是否是 `layout-header-right` 这类完整名称。
- 显式 slot 名称是否是 `header-right` 这类 slot 名。
- `custom` 区域是否真的提供了 slot、命名视图、配置组件或 addon。

### 布局偏好没有影响某个页面

`preferences.layoutMode` 只影响未固定的标准布局页面。检查当前路由的最终 `meta.layout`：字符串 `blank`、未显式 `fixed: false` 的 blank 对象，以及对象里声明了 `fixed: true` 的路由都不会被布局偏好覆盖；如果父级声明了 fixed layout，子级也会通过 Vue Router meta 合并继承这个固定策略，除非子级重新声明自己的 layout。

### 页签没有显示

检查：

- `preferences.pageElements.tabs` 是否为 `true`。
- 路由是否有 `meta.title`。
- 路由是否 `hidden`。
- 自定义 `tabs.addRouteView()` 是否把数据写入了 `visibleViews`。

### KeepAlive 没有缓存

检查：

- 路由是否设置 `meta.keepAlive: true`。
- 自定义 tabs adapter 是否维护了 `cachedViews` 或 `cachedViewSet`。
- 参数页是否需要设置稳定的 `meta.cacheKey`。

### iframe 页面仍显示普通页面组件

检查当前命中的路由 `meta.iframeSrc` 是否是非空字符串。iframe 逻辑只读取当前路由 meta，不读取父路由或业务组件内部状态。
