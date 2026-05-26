import type { RouteRecordRaw } from 'vue-router'
import type { Layout } from './public'

/**
 * layouts 内部渲染契约。
 *
 * public.ts 面向使用者，描述 route.meta.layout、区域组件 props、context 和公共运行时入口；
 * internal.ts 面向布局内部组件，描述“已经解析完成、可以直接渲染”的状态形状。
 *
 * 边界要求：
 * - 这里可以复用 Layout 公共类型，但不能新增对业务 Store、业务页面、权限实现的依赖。
 * - 这里的类型只服务 AppLayout、runtime、utils 和布局内部组件，不作为外部使用者的首选入口。
 * - 公共自定义区域组件仍只接收 `Layout['Area']['Props']`，不能暴露这些内部渲染状态。
 */

// 解析后的区域模式；仅布局内部渲染层使用。
export type AreaMode = Layout['Area']['Mode']
// 解析后的区域附加组件；公共类型已表达完整形状，内部只复用不再重复声明字段。
export type ResolvedAddon = Layout['Area']['ResolvedAddon']
// 解析后的基础区域配置；运行时已经把 mode、component、addons 等输入形态归一化。
export type ResolvedArea = Layout['Area']['ResolvedConfig']

// 解析后的顶部栏区域；包含 left/brand/center/right 子区。
export type ResolvedHeader = Layout['Header']['ResolvedConfig']
// 解析后的侧边栏区域；包含 header/content/footer 子区。
export type ResolvedSidebar = Layout['Sidebar']['ResolvedConfig']
// 解析后的内容区区域；包含 before/after 附加区。
export type ResolvedContent = Layout['Content']['ResolvedConfig']
// 解析后的底部栏区域；包含 left/center/right 子区。
export type ResolvedFooter = Layout['Footer']['ResolvedConfig']

/**
 * AppLayout 内部消费的最终布局声明。
 *
 * route.meta.layout、区域预设、用户布局偏好和默认值都应该先解析成这个结构。
 * 命名视图、显式 slots 和移动端侧边栏状态由 runtime/AreaOutlet 另行参与渲染判定，不写进 ResolvedLayout。
 */
export interface ResolvedLayout {
  // 当前布局名称。
  name: Layout['Name']
  // 顶部栏最终配置。
  header: ResolvedHeader
  // 侧边栏最终配置。
  sidebar: ResolvedSidebar
  // 内容区最终配置。
  content: ResolvedContent
  // 底部栏最终配置。
  footer: ResolvedFooter
}

/**
 * 默认导航渲染所需的内部状态。
 *
 * 这个状态只服务内置 NavigationMenu、RouteMetaBar、sidebar/header 默认区域；
 * 自定义区域组件如果需要导航信息，应通过自己的业务 context 或自定义组件来源处理，不把内部导航状态扩散到公共区域 props。
 */
export interface RenderNav {
  // 由路由树派生后的菜单项。
  items: Layout['Menu']['Item'][]
  // 当前激活路径，用于菜单选中、固定页签和面包屑状态。
  activePath: string
  // 侧边栏和顶部导航的菜单展开模式。
  menuMode: {
    // 侧边栏递归菜单默认展开方式。
    sidebar: Layout['Menu']['Mode']
    // 顶部导航下拉菜单默认展开方式。
    topnav: Layout['Menu']['Mode']
  }
}

// 高频页面元素开关；避免渲染层反复穿透 preferences.pageElements。
export interface RenderElements {
  // 是否展示已访问页签栏。
  tabs: boolean
  // 是否展示面包屑栏。
  breadcrumb: boolean
  // 顶部栏是否固定在滚动容器外。
  headerFixed: boolean
  // 底部栏是否固定在滚动容器外。
  footerFixed: boolean
}

// 当前页面展示状态；默认品牌、标题和路由元信息区使用。
export interface RenderPage {
  // 当前页面标题；优先来自 route.meta.title，缺失时使用默认标题。
  title: string
}

/**
 * 布局壳渲染状态。
 *
 * 这些布尔值集中描述 shell 是否应该渲染 header/sidebar/footer，以及 sidebar 是否以 rail 形态展示。
 * 模板只读这些派生结果，不直接重复判断 layout name、viewport、用户偏好和区域声明。
 */
export interface RenderShell {
  // 当前布局是否是 topnav/sidebar/hybrid 之一。
  isStandardLayout: boolean
  // 是否渲染顶部栏；blank 永远不渲染 header。
  shouldRenderHeader: boolean
  // 是否渲染侧边栏；受布局名称、移动端视口、sidebar mode 和区域声明共同影响。
  shouldRenderSidebar: boolean
  // 是否渲染底部栏；没有 footer 内容或声明为 false 时不渲染。
  shouldRenderFooter: boolean
  // 侧边栏是否以桌面窄栏 rail 形态渲染。
  renderSidebarAsRail: boolean
}

/**
 * 布局内部组件共享的渲染上下文。
 *
 * AppLayout 运行时统一派生这个对象，header/sidebar/content/footer/RouteMetaBar/AreaOutlet 都从这里读状态。
 * 公共自定义区域组件仍只接收 `Layout['Area']['Context']`，不能直接依赖 RenderContext，避免内部结构成为外部 API。
 */
export interface RenderContext {
  // 传给公共区域组件和 slots 的稳定 context。
  context: Layout['Area']['Context']
  // 当前布局最终解析结果。
  layout: ResolvedLayout
  // 当前参与菜单、面包屑、页签派生的路由树。
  routes: RouteRecordRaw[]
  // 布局设置响应式对象。
  settings: Layout['State']
  // 外部 tabs adapter；未提供时由内部页签状态兜底。
  tabs?: Layout['Tabs']['Context']
  // 内置导航渲染状态。
  navigation: RenderNav
  // 高频页面元素开关。
  elements: RenderElements
  // 当前页面展示状态。
  page: RenderPage
  // 布局壳渲染状态。
  shell: RenderShell
}

// 固定页签渲染结构；由 affix 路由派生，RouteMetaBar 使用。
export interface AffixItem {
  // 页签唯一标识。
  name: string
  // 页签显示标题。
  title: string
  // 页签跳转路径。
  path: string
  // 已归一化排序值。
  order: number
  // 是否为当前激活路由。
  isActive: boolean
}

// 面包屑渲染结构；由当前 matched route 链派生。
export interface BreadcrumbItem {
  // 面包屑显示标题。
  title: string
  // 面包屑跳转路径。
  path: string
}
