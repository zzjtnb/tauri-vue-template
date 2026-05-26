/**
 * layouts 公共类型契约。
 *
 * 这个文件是布局模块对外边界的唯一类型来源：业务路由声明、AppLayout 入参、区域组件、设置面板、菜单、面包屑、页签适配器
 * 都必须通过这里的对象化类型路径表达。具体渲染、状态派生和路由解析仍放在 runtime、utils、composables 和组件内。
 *
 * 设计边界：
 * - public.ts 只定义公共类型，不引用 runtime 函数，不组装运行时对象。
 * - public.ts 不实现布局算法，不读取业务 Store，不导入业务页面。
 * - 对外不导出旧式平铺类型，避免入口越来越散。
 * - 文件内私有类型只服务分组类型；对外只通过 `Layout['Area']`、`Layout['Route']` 等对象路径暴露。
 */
import type { AsyncComponentLoader, Component, HTMLAttributes, MaybeRefOrGetter, Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteMeta, RouteRecordNameGeneric, RouteRecordRaw } from 'vue-router'
import type { RegionName, RegionPart } from './regions'

// 路由级布局名称，由 AppLayout 从当前 `route.meta.layout` 解析。
type Name = 'topnav' | 'sidebar' | 'hybrid' | 'blank'

/**
 * 标准布局名称，可由布局设置在运行时切换。
 *
 * `blank` 是路由强语义布局，适合错误页、独立落地页等独立页面；字符串 `blank` 和未显式声明 fixed 的 blank 对象默认固定。
 * 用户偏好只能选择 topnav/sidebar/hybrid，因此标准布局不包含 blank。
 */
type StandardName = Exclude<Name, 'blank'>

// 布局主题模式。
type ThemeMode = 'system' | 'light' | 'dark'

/**
 * 布局主题色名称。
 *
 * 这些值对应 `packages/theme/src/styles/theme/tokens` 下的主题 token class。
 * 布局组件内部只消费语义色变量，不应该把业务颜色硬编码进布局类型或组件。
 */
type ThemeColor = 'neutral' | 'blue' | 'violet' | 'teal' | 'rose' | 'amber'

/**
 * 菜单分组展示模式。
 *
 * 这个值只影响递归菜单分组的默认展开方式，不改变路由树、权限过滤或菜单数据本身。
 */
type MenuMode = 'collapse' | 'expand'

// 菜单跳转目标；默认当前窗口打开，只有新窗口需要显式声明。
type MenuTarget = '_blank'

/**
 * 侧边栏折叠后的显示策略。
 *
 * - auto：第三方库式默认体验，桌面端折叠为 rail，移动端折叠后直接 hidden。
 * - rail：保留窄栏，适合桌面端持续保留导航入口。
 * - hidden：完全隐藏侧边栏，适合移动端 overlay 关闭态或内容优先页面。
 */
type SidebarCollapseMode = 'auto' | 'rail' | 'hidden'

/**
 * 侧边栏运行态。
 *
 * 这是运行时 UI 状态，不等同于用户偏好：
 * - expanded：完整展开。
 * - collapsed：折叠为 rail。
 * - hidden：完全隐藏。
 */
type SidebarMode = 'expanded' | 'collapsed' | 'hidden'

// iframe referrerPolicy 可选安全策略；未配置时使用浏览器默认行为。
type IframeReferrerPolicy = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'

/**
 * 区域声明模式。
 *
 * 区域模式让使用者在“默认区域”和“自定义区域”之间显式切换：
 * - false：不渲染该区域。
 * - default：启用内置默认区域内容。
 * - custom：只渲染自定义来源，没有自定义内容时开发环境应警告。
 * - auto：有自定义来源时优先自定义，否则使用该区域默认策略。
 */
type AreaMode = false | 'default' | 'custom' | 'auto'

interface SettingTriggerConfig {
  // 设置入口跳转地址；未配置时打开内置布局设置面板。
  to?: string
}

type SettingTriggerDeclaration = boolean | string | SettingTriggerConfig

/**
 * 区域附加内容。
 *
 * addon 用于插入设置入口、用户操作、状态提示、版本信息等轻量内容，不用于接管区域主体。
 * 主体替换应该使用区域 component、命名视图或显式 slot。
 */
interface ResolvedAddon {
  // 附加组件本体。
  component: Area['Component']
  // 透传给附加组件的静态 props；运行时不做业务解释。
  props?: Record<string, unknown>
  // 附加内容的可视 class，不承载 safe-area 或滚动边界语义。
  class?: HTMLAttributes['class']
  // 附加内容无障碍名称，会落到对应 aria-label。
  label?: string
}

type AreaAddon = ResolvedAddon

/**
 * addon 输入形态。
 *
 * 单个 addon 对象和数组都会在运行时归一化为列表；`false` 表示清空继承的同侧 addons，适合覆盖区域预设带来的默认附加内容。
 */
type AreaAddonInput = false | AreaAddon | readonly AreaAddon[]

// 区域前后附加内容配置。
interface AreaAddons {
  // 区域主体内容前的附加内容。
  before?: AreaAddonInput
  // 区域主体内容后的附加内容。
  after?: AreaAddonInput
}

/**
 * 单个区域配置对象。
 *
 * header、sidebar、content、footer 及它们的所有子区都共享这组基础字段：
 * mode 控制渲染策略，component 提供自定义来源，class/label 描述可视内容和无障碍名称，addons 插入轻量附加内容。
 * safe-area、页面主边距、滚动边界属于 layout 壳，不应该散写在业务区域配置里。
 */
interface AreaConfig {
  // 区域渲染模式；false=关闭，default=默认内容，custom=只用自定义来源，auto=有自定义来源时优先自定义。
  mode?: AreaMode
  // 自定义区域组件；与 slots、命名视图共同参与区域来源优先级。
  component?: Area['Component']
  // 区域可视内容 class，不承载 safe-area 或滚动边界语义。
  class?: HTMLAttributes['class']
  // 区域无障碍名称，会落到 aria-label。
  label?: string
  // 区域前后附加内容。
  addons?: AreaAddons
}

/** 单个区域声明入口；支持模式值或带 component/class/label/addons 的配置对象。 */
type AreaDeclaration = AreaMode | AreaConfig

/** 单个区域解析结果；渲染层只消费解析后的结构，不再读取原始 layout 声明。 */
interface ResolvedArea {
  // 归一化后的区域模式。
  mode: AreaMode
  // 归一化后的区域组件；不存在时由内置默认内容、slot 或命名视图兜底。
  component?: Area['Component']
  // 归一化后的区域可视 class。
  class?: HTMLAttributes['class']
  // 归一化后的区域无障碍名称。
  label: string
  // 归一化后的区域前后附加内容；渲染层只消费数组，不再判断 false、单项或数组输入形态。
  addons: {
    before: ResolvedAddon[]
    after: ResolvedAddon[]
  }
}

/** 复合区域专属字段；all 批量填充全部子区。 */
interface RegionExtra {
  // 把同一声明应用到当前复合区域的所有子区；显式子区声明仍可单独覆盖。
  all?: AreaDeclaration
}

/** 任意复合区域配置：整区支持 AreaConfig，all 和显式子区继续支持模式值或完整 AreaConfig。 */
type RegionConfig<TName extends RegionName> = AreaConfig & RegionExtra & Partial<Record<RegionPart<TName>, AreaDeclaration>>
/** 任意复合区域声明：所有整区都支持模式值、完整配置对象。 */
type RegionDeclaration<TName extends RegionName> = AreaMode | RegionConfig<TName>
/** 任意复合区域解析结果：整区基础字段加上每个子区的解析结果。 */
type ResolvedRegion<TName extends RegionName> = ResolvedArea & Record<RegionPart<TName>, ResolvedArea>

/**
 * 完整 layout 对象声明。
 *
 * 这是复杂页面的 route.meta.layout 形状。普通页面只写布局名称即可；复杂工作区可以在这里声明区域预设和局部区域覆盖。
 * fixed=true 表示固定当前路由声明的布局，不跟随设置面板里的标准布局模式。
 */
interface Config {
  // 页面使用的布局类型。
  name: Name
  // 引用 context.areas 中注册的区域预设；多个预设按声明顺序合并。
  areas?: string | string[]
  // 默认设置入口声明；false=关闭，字符串=跳转地址，缺省=打开内置面板，对象=透传给设置触发器。
  settings?: SettingTriggerDeclaration
  // 是否固定当前布局声明；true 时不跟随设置面板里的标准布局模式；blank 未声明 fixed 时默认固定，fixed=false 可显式取消。
  fixed?: boolean
  // 顶部栏声明；支持 false/auto/完整配置对象，完整配置对象可用 all 或继续覆盖 left/brand/center/right。
  header?: RegionDeclaration<'header'>
  // 侧边栏声明；支持 false/auto/完整配置对象，完整配置对象可用 all 或继续覆盖 header/content/footer。
  sidebar?: RegionDeclaration<'sidebar'>
  // 内容区声明；支持 false/auto/完整配置对象，完整配置对象可用 all 或继续覆盖 before/after。
  content?: RegionDeclaration<'content'>
  // 底部栏声明；支持 false/auto/完整配置对象，完整配置对象可用 all 或继续覆盖 left/center/right。
  footer?: RegionDeclaration<'footer'>
}

/**
 * `route.meta.layout` 的入口类型。
 *
 * 简单页面写 `'sidebar'`、`'topnav'`、`'hybrid'`、`'blank'`；复杂页面写完整对象。
 */
type Declaration = Name | Config

/**
 * 区域预设。
 *
 * 预设用于多页面复用同一组 settings/header/sidebar/content/footer 配置，不允许覆盖布局名称、预设引用链和固定策略。
 */
type AreaPreset = Omit<Config, 'name' | 'areas' | 'fixed'>

// 布局运行时解析后的完整声明。
interface ResolvedLayout {
  // 解析后的布局名称。
  name: Name
  // 顶部栏解析结果。
  header: ResolvedRegion<'header'>
  // 侧边栏解析结果。
  sidebar: ResolvedRegion<'sidebar'>
  // 内容区解析结果。
  content: ResolvedRegion<'content'>
  // 底部栏解析结果。
  footer: ResolvedRegion<'footer'>
}

// 主题完整值，作为 preferences.theme 的持久化形状。
interface ThemeValue {
  // system 表示跟随系统，light/dark 表示用户显式选择。
  mode: ThemeMode
  // 主题色对应全局 theme token class，布局内部只消费语义色变量。
  color: ThemeColor
}

/**
 * 可持久化的布局偏好。
 *
 * preferences 可以进入 localStorage、Pinia persisted state 或其他持久化容器；运行时临时状态必须放在 ui，避免刷新后恢复错误的面板开关或侧边栏瞬时态。
 */
interface Preferences {
  // 主题设置只描述布局层需要的 class 决策，真正写入 documentElement 由运行时同步逻辑完成。
  theme: ThemeValue
  // layoutMode 只保存当前标准布局覆盖值；null 表示跟随当前 route.meta.layout；fixed 路由不会被覆盖，blank 未显式 fixed=false 时默认固定。
  layoutMode: StandardName | null
  // 导航设置只保存当前值；选项文案、描述和图标由设置面板维护。
  navigation: {
    // 侧边栏设置同时承接显示隐藏策略和递归菜单默认展开策略。
    sidebar: {
      // auto 会根据视口切换：桌面 rail，移动端 hidden。
      collapseMode: SidebarCollapseMode
      // 只影响侧边栏树形分组的默认展开状态，不改变菜单数据。
      menuMode: MenuMode
    }
    // 顶部导航设置只影响下拉面板内的递归菜单展开方式。
    topnav: {
      // 顶部导航下拉面板内的递归菜单默认展开方式。
      menuMode: MenuMode
    }
  }
  // 页面元素设置只保存布尔值；route meta 仍决定条目是否存在，这里只决定对应区域是否展示或固定。
  pageElements: {
    // tabs 只控制已访问页签栏是否显示，页签数据仍由内部状态或外部 adapter 提供。
    tabs: boolean
    // breadcrumb 由路由声明决定条目，这里只控制面包屑栏显示。
    breadcrumb: boolean
    // 顶部栏固定状态只影响滚动边界，Header 本身仍是标准布局内置区域。
    headerFixed: boolean
    // 底部栏固定状态只在存在 footer 内容时生效。
    footerFixed: boolean
  }
}

/**
 * 不持久化的布局运行态。
 *
 * ui 只描述当前会话当前页面的瞬时交互状态，不应该写入长期持久化，否则会出现刷新后设置面板自动打开、移动端侧边栏状态错乱等问题。
 */
interface UiState {
  // 设置面板运行态。
  settings: {
    // 设置面板是否打开。
    open: boolean
  }
  // 侧边栏运行态。
  sidebar: {
    // 当前侧边栏模式。
    mode: SidebarMode
  }
}

/**
 * 布局设置完整状态。
 *
 * 这是 AppLayout、设置面板和运行时之间的响应式对象契约；具体持久化由外部 store 承担。
 */
export interface State {
  // 可持久化用户偏好。
  preferences: Preferences
  // 不持久化运行态。
  ui: UiState
}

/**
 * 已访问页签渲染结构。
 *
 * 页签由当前路由 title/path/fullPath/keepAlive/affix 派生；布局库内置轻量状态，宿主也可以通过 tabs adapter 接入外部 Store。
 */
interface VisitedTab {
  // 路由名；没有路由名时仍以路径作为导航兜底。
  name?: RouteRecordNameGeneric
  // 页签显示标题。
  title: string
  // 页签跳转路径。
  path: string
  // 包含 query/hash 的完整路径，用于区分同一路由的不同参数实例。
  fullPath: string
  // 是否固定到页签栏。
  affix?: boolean
  // 是否需要 keep-alive 缓存。
  keepAlive?: boolean
}

/**
 * 页签适配器。
 *
 * 宿主可以用它接入外部 tabs Store；布局库只调用这些方法，不关心背后是 Pinia、VueUse 还是其他状态容器。
 * 如果传入自定义 tabs，页签清理、缓存 include 维护和删除策略都应由自定义适配器负责。
 */
interface TabsContext {
  // 可见页签列表。
  visibleViews: Readonly<Ref<VisitedTab[]>>
  // KeepAlive include 列表。
  cachedViews: Readonly<Ref<string[]>>
  // KeepAlive include Set；存在时优先使用，避免大列表反复 includes。
  cachedViewSet?: Readonly<Ref<Set<string>>>
  // 当前路由进入布局后写入页签。
  addRouteView: (route: RouteLocationNormalizedLoaded) => void
  // 删除当前页签。
  delView: (view: VisitedTab) => void
  // 删除其他页签。
  delOtherViews: (view: VisitedTab) => void
  // 删除左侧页签。
  delLeftViews: (view: VisitedTab) => void
  // 删除右侧页签。
  delRightViews: (view: VisitedTab) => void
  // 删除全部页签。
  delAllViews: () => void
  // 更新已访问页签；外部 Store 不需要时可以省略。
  updateVisitedView?: (view: VisitedTab) => void
}

/**
 * 布局上下文。
 *
 * 这是布局库唯一的外部依赖入口。AppLayout 不直接依赖 Pinia、业务路由模块、用户 Store 或权限实现；
 * 宿主通过 context 把 routes、settings、areas、tabs 适配进来。
 */
interface Context {
  // 用于派生导航菜单、固定页签和面包屑的路由树。
  routes: MaybeRefOrGetter<RouteRecordRaw[]>
  // 布局设置对象，由调用方传入，AppLayout 不直接依赖外部 Store。
  settings: State
  // 区域预设注册表，供 route.meta.layout.areas 引用。
  areas?: Record<string, AreaPreset>
  // 可选外部页签 adapter；未提供时使用布局库内部轻量页签状态。
  tabs?: TabsContext
}

// LayoutRuntime.create 插件参数。
interface PluginOptions {
  // 全局默认布局上下文；插件安装时只读取一次，也可以在 AppLayout props 或 provide 中局部覆盖。
  context?: MaybeRefOrGetter<Context>
}

/**
 * 自定义区域组件和显式 slots 的唯一入参。
 *
 * 旧式拆分 props 很容易让 sidebar/settings/actions 到处透传；统一 context 后，自定义区域组件只需要接收一个对象，
 * 既能拿到当前区域信息，也能操作侧边栏和设置面板。
 */
interface AreaContext {
  // 当前区域信息；完整区域和子区域都会带上 region/part，方便自定义组件判断位置。
  area?: {
    // 区域名称，例如 layout-header-right。
    name: string
    // 区域无障碍名称。
    label: string
    // 当前区域解析后的模式。
    mode: AreaMode
    // 所属大区，例如 header/sidebar/content/footer。
    region: string
    // 子区名称，例如 left/right/content；完整区域可使用 root。
    part: string
  }
  // 当前布局声明；已完成预设、路由声明、默认值和用户偏好的解析。
  layout: {
    // 当前布局名称。
    name: Name
    // 当前布局完整解析结果。
    declaration: ResolvedLayout
  }
  // 当前路由对象。
  route: RouteLocationNormalizedLoaded
  // 当前视口信息。
  viewport: {
    // 是否为移动端视口。
    mobile: boolean
  }
  // 侧边栏运行态和操作集合。
  sidebar: {
    // 当前侧边栏模式。
    mode: SidebarMode
    // 是否处于折叠态。
    collapsed: boolean
    // 是否处于隐藏态。
    hidden: boolean
    // 是否可见。
    visible: boolean
    // 在展开和折叠/隐藏之间切换。
    toggle: () => void
    // 隐藏侧边栏，移动端菜单选择后常用。
    close: () => void
    // 展开侧边栏。
    expand: () => void
    // 折叠侧边栏。
    collapse: () => void
    // 显式设置侧边栏运行态。
    setMode: (mode: SidebarMode) => void
  }
  // 设置面板运行态和操作集合。
  settings: {
    // 设置面板是否打开。
    open: boolean
    // 打开设置面板。
    show: () => void
    // 关闭设置面板。
    hide: () => void
    // 切换设置面板。
    toggle: () => void
  }
}

// 自定义区域组件 props；所有区域组件都只接收 context。
interface AreaProps {
  // 区域上下文。
  context: AreaContext
}

/**
 * 路由、菜单和页签共享的展示字段。
 *
 * 布局层用 title 派生菜单、面包屑、页签和页面标题；icon/order/hidden 服务菜单、固定页签和已访问页签。
 * 权限、登录态等项目级字段不属于布局公共契约，应放在项目自己的 router/types.ts 中。
 */
interface DisplayMeta {
  // 菜单、面包屑、固定页签、已访问页签和页面标题。
  title?: string
  // 菜单和页签图标 UnoCSS/Iconify 类名；动态图标需 safelist 或静态映射。
  icon?: string
  // 菜单和固定页签排序，值越小越靠前。
  order?: number
  // 是否从菜单、固定页签和已访问页签中隐藏。
  hidden?: boolean
}

// 路由和菜单共享的父子菜单展示策略。
interface MenuMeta {
  // 父级只有一个子路由时是否仍强制显示父级菜单。
  alwaysShow?: boolean
  // 是否在侧边栏隐藏子菜单，仅显示当前项。
  hideChildrenInMenu?: boolean
}

/**
 * 前端路由元信息。
 *
 * layout 层只消费展示、菜单、layout、iframe、breadcrumb、keepAlive 和 affix 等字段；
 * 项目级 requiresAuth、roles、perms 等鉴权字段应放在 router/types.ts 的 AppRouteMeta 中，由路由守卫和权限 Store 消费。
 */
interface Meta extends RouteMeta, DisplayMeta, MenuMeta {
  // 页面使用的布局声明；子路由未设置时跟随 Vue Router meta 合并结果，整条链未设置时使用默认布局。
  layout?: Declaration
  // 菜单打开目标；未配置时沿用当前窗口。
  menuTarget?: MenuTarget
  // 外链地址；存在时一般不走内部组件渲染。
  externalLink?: string
  // iframe 内嵌地址；存在时标准内容出口不再渲染普通路由组件。
  iframeSrc?: string
  // iframe sandbox 安全策略；未配置时不输出 sandbox 属性。
  iframeSandbox?: string
  // iframe referrerPolicy 安全策略；未配置时使用浏览器默认行为。
  iframeReferrerPolicy?: IframeReferrerPolicy
  // iframe allow 权限策略；未配置时不输出 allow 属性。
  iframeAllow?: string
  // 是否加入面包屑条目；默认加入，false 时排除该级。
  breadcrumb?: boolean
  // 是否需要 keep-alive 缓存。
  keepAlive?: boolean
  // 缓存键，多实例页签或参数化缓存场景可用。
  cacheKey?: string
  // 是否固定到页签栏。
  affix?: boolean
}

// 绑定布局 meta 的路由记录；children 递归保持同一 meta 泛型。
interface RouteRecord<TMeta extends Meta = Meta> extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  // 布局路由 meta。
  meta?: TMeta
  // 子路由；递归保持同一 meta 泛型。
  children?: RouteRecord<TMeta>[]
}

/**
 * 模块化路由生成参数。
 *
 * `LayoutRuntime.defineRoutes()` 用它把多个路由模块合并成带 AppLayout 壳的路由树；公共白名单路由留在壳外，业务路由放到 children 中。
 */
interface RouteOptions<TMeta extends Meta = Meta> {
  // 路由模块集合，通常来自 import.meta.glob 或模块 barrel。
  modules: Record<string, unknown>
  // 放在布局壳外的路由导出名，默认包含 publicRoutes。
  publicRouteKeys?: readonly string[]
  // 识别业务路由数组的导出名后缀，默认 Routes。
  routeExportSuffix?: string
  // 根布局路由的覆盖配置；component 和 children 由 defineRoutes 接管。
  root?: Partial<Omit<RouteRecord<TMeta>, 'component' | 'children'>>
}

/**
 * 布局菜单渲染结构。
 *
 * 菜单由路由树派生，侧边栏和顶部导航共用同一结构；布局层不直接读取业务权限 Store。
 */
export interface MenuItem extends Required<Pick<DisplayMeta, 'title'>>, Pick<DisplayMeta, 'icon'>, MenuMeta {
  // 菜单唯一标识，优先路由名，兜底路径。
  name: string
  // 已归一化排序值。
  order: number
  // 内部路由路径。
  path?: string
  // 外链地址。
  externalLink?: string
  // 菜单打开目标；未配置时沿用当前窗口。
  menuTarget?: MenuTarget
  // 子菜单。
  children?: MenuItem[]
}

/**
 * AppLayout 的完整入参。
 *
 * 根布局组件应该保持薄入口：只负责接收可选 context、读取 provider/default context，并把解析后的运行时状态交给内部布局组件。
 * 业务路由、权限、用户信息、持久化 store 都不能直接塞进 AppLayout props；这些能力统一通过 Layout['Context'] 适配。
 */
interface App {
  Props: {
    // 可选布局上下文；未传入时依次读取组件树 provider 和全局默认上下文。
    context?: Context
  }
}

/**
 * 布局主题契约。
 *
 * 主题只描述布局层需要的 class 决策：mode 决定 light/dark/system，color 对应全局 theme token class。
 * 布局组件内部只能消费语义色变量，不应该把业务颜色或组件私有色值写进类型契约。
 */
interface Theme {
  // 主题模式：system 表示跟随系统，light/dark 表示用户显式选择。
  Mode: ThemeMode
  // 主题色名称，对应 packages/theme/src/styles/theme/tokens 下的主题类。
  Color: ThemeColor
  // 主题完整值，作为 preferences.theme 的持久化形状。
  Value: ThemeValue
}

/**
 * 导航菜单契约。
 *
 * 菜单数据必须由路由树派生，侧边栏和顶部导航共用同一结构；布局层不直接读取业务权限 Store，
 * 权限过滤应在传入 routes 之前完成，或由宿主在路由生成阶段完成。
 */
interface Menu {
  // 菜单分组展示模式：collapse 表示默认收起分组，expand 表示默认展开分组。
  Mode: MenuMode
  // 菜单跳转目标；默认当前窗口打开，只有新窗口需要显式声明。
  Target: MenuTarget
  // 路由菜单树 meta；控制父级强制显示、隐藏子菜单等树形展示策略。
  TreeMeta: MenuMeta
  // 高级导航渲染结构；由路由树归一化而来，侧边栏和顶部导航共用。
  Item: MenuItem
}

/**
 * 布局区域契约。
 *
 * 区域是布局系统的核心扩展点。header/sidebar/content/footer 以及它们的子区域都使用同一套声明规则：
 * 可以写模式或配置对象；组件来源统一放在配置对象的 component 字段；可以从区域预设、route.meta.layout、命名视图和显式 slots 多个来源合并；
 * 最终都被解析成 ResolvedConfig 后交给 AreaOutlet 渲染。
 */
interface Area {
  // 区域声明模式：false=不渲染，default=默认内容，custom=只用自定义内容，auto=有自定义内容时优先自定义。
  Mode: AreaMode
  // 区域组件类型；支持带 props 的 SFC/defineComponent 组件、defineAsyncComponent loader 和延迟 import 函数。
  Component: Component | AsyncComponentLoader<Component>
  // 单个区域 addon；用于插入设置入口、用户操作、状态提示等轻量组件，不接管区域主体。
  Addon: AreaAddon
  // 区域 addon 解析结果；运行时已经把输入归一化为对象数组。
  ResolvedAddon: ResolvedAddon
  // addon 或 addon 数组；false 表示清空继承项，适合覆盖区域预设带来的默认附加内容。
  AddonInput: AreaAddonInput
  // 区域前后 addon 配置；before/after 都会被归一化为列表后渲染。
  Addons: AreaAddons
  // 单个区域配置对象；class 只描述可视内容，不承载 safe-area 或滚动边界语义。
  Config: AreaConfig
  // 区域声明入口；使用者可以直接写模式或完整配置对象。
  Declaration: AreaDeclaration
  // context.areas 的区域预设；用于多页面复用同一组 header/sidebar/content/footer 配置。
  Preset: AreaPreset
  // 区域解析结果；渲染层只消费这个结构，不再读取原始 layout 声明。
  ResolvedConfig: ResolvedArea
  // 自定义区域组件和 slot 收到的上下文；这是区域扩展的唯一入参，避免散 props 蔓延。
  Context: AreaContext
  // 自定义区域组件 props；所有区域组件都只接收 context。
  Props: AreaProps
}

/**
 * 顶部栏契约。
 *
 * 顶部栏是标准布局的内置区域；blank 不渲染 header，也不读取 header 命名视图。
 * headerFixed 只改变滚动边界，不改变顶部栏区域本身的配置来源和 slot 规则。
 */
interface Settings {
  // 设置触发器配置；可用于 header、sidebar 或任意区域 addon 中的 SettingsTrigger。
  Trigger: SettingTriggerConfig
  // 设置触发器声明；false=关闭默认入口，字符串=跳转地址，true/缺省=打开内置面板，对象=透传给触发器。
  TriggerDeclaration: SettingTriggerDeclaration
}

interface Header {
  // 顶部栏声明；支持 false/auto 或完整 header 与 left/brand/center/right 四个子区。
  Declaration: RegionDeclaration<'header'>
  // 顶部栏配置对象；需要 settings 或子区覆盖时使用。
  Config: RegionConfig<'header'>
  // 顶部栏解析结果；每个子区都已归一化为 ResolvedConfig。
  ResolvedConfig: ResolvedRegion<'header'>
}

/**
 * 侧边栏契约。
 *
 * sidebar/hybrid 使用常驻侧边栏；移动端 topnav 可以复用侧边栏承接菜单 overlay。
 * hidden 会完全移除侧边栏，collapsed/rail 保留窄栏，expanded 展开完整内容。
 */
interface Sidebar {
  // 侧边栏折叠后的显示策略：auto=按视口智能选择，rail=保留窄栏，hidden=完全隐藏。
  CollapseMode: SidebarCollapseMode
  // 侧边栏运行态：expanded=展开，collapsed=折叠为 rail，hidden=完全隐藏。
  Mode: SidebarMode
  // 侧边栏配置对象；需要覆盖 header/content/footer 子区时使用。
  Config: RegionConfig<'sidebar'>
  // 侧边栏声明；支持 false/auto 或完整 sidebar 与 header/content/footer 三个子区。
  Declaration: RegionDeclaration<'sidebar'>
  // 侧边栏解析结果；渲染层据此决定顶部、内容和底部区域。
  ResolvedConfig: ResolvedRegion<'sidebar'>
}

/**
 * 内容区契约。
 *
 * 内容区负责承接标准 RouterView、iframe、KeepAlive 和页面级 before/after 附加区。
 * 页面如果需要整页接管内容区，应使用 `LayoutRuntime.defineContent()`，不要手写 `layout-content` 字符串。
 */
interface Content {
  // 内容区配置对象；需要覆盖主内容容器与 before/after 附加区时使用。
  Config: RegionConfig<'content'>
  // 内容区声明；支持 false/auto 或主内容容器与 before/after 两个附加区。
  Declaration: RegionDeclaration<'content'>
  // 内容区解析结果；before/default/after 都已归一化。
  ResolvedConfig: ResolvedRegion<'content'>
}

/**
 * 底部栏契约。
 *
 * footer 默认没有内容就不渲染；显式 slot、命名视图或 layout 配置都可以提供内容。
 * footerFixed 只改变所在滚动边界，不能把业务页面的局部状态栏混同为应用底栏。
 */
interface Footer {
  // 底部栏声明；支持 false/auto 或完整 footer 与 left/center/right 三个子区。
  Declaration: RegionDeclaration<'footer'>
  // 底部栏配置对象；需要覆盖 left/center/right 子区时使用。
  Config: RegionConfig<'footer'>
  // 底部栏解析结果；每个子区都已归一化为 ResolvedConfig。
  ResolvedConfig: ResolvedRegion<'footer'>
}

/**
 * 页签契约。
 *
 * 布局库内置轻量已访问页签状态；需要接入外部 Store 时使用 Context 适配器。
 * 如果传入自定义 tabs，页签清理、缓存 include 维护和删除策略都应由自定义适配器负责。
 */
interface Tabs {
  // 已访问页签记录；由当前路由 title/path/fullPath/keepAlive/affix 派生。
  Visited: VisitedTab
  // 外部页签适配器；布局库只调用方法，不关心背后是 Pinia、VueUse 还是其他状态容器。
  Context: TabsContext
}

/**
 * 路由契约。
 *
 * 布局层只消费展示、菜单、layout、iframe、breadcrumb、keepAlive 和 affix 等字段；
 * 项目级 requiresAuth、roles、perms 等鉴权字段应放在 router/types.ts 的 AppRouteMeta 中，由路由守卫和权限 Store 消费。
 */
interface Route<TMeta extends Meta = Meta> {
  // iframe referrerPolicy 可选安全策略；未配置时使用浏览器默认行为。
  IframeReferrerPolicy: IframeReferrerPolicy
  // 路由展示 meta；title 服务菜单、面包屑、页签和页面标题，icon/order/hidden 服务菜单和页签。
  DisplayMeta: DisplayMeta
  // 布局路由 meta 字段；泛型允许项目扩展，但不能破坏布局库的基础字段。
  Meta: TMeta
  // 绑定布局 meta 的路由记录；children 递归保持同一 meta 泛型。
  RecordRaw: RouteRecord<TMeta>
  // `LayoutRuntime.defineRoutes()` 参数；用于模块化路由生成带 AppLayout 壳的路由树。
  AppRoutesOptions: RouteOptions<TMeta>
}

/**
 * 布局系统公共类型入口。
 *
 * 这个接口承担分组类型总目录职责：使用者不再从入口导入一长串平铺 Props、Meta 或 Tab 类型，
 * 而是通过 `Layout['Area']['Props']`、`Layout['Route']['Meta']`、`Layout['Tabs']['Visited']` 读取同类能力。
 *
 * `Layout` 在这里只作为类型根入口；运行时公共对象叫 `LayoutRuntime`，定义在 runtime/api.ts 中。
 * 公共出口用 `export type { Layout }` 明确暴露类型，用 `export { LayoutRuntime }` 明确暴露运行时对象。
 */
export interface Layout<TMeta extends Meta = Meta> {
  // 路由级布局名称，由 AppLayout 从当前 `route.meta.layout` 解析。
  Name: Name
  // 标准布局名称，可由布局设置在运行时切换；用户偏好只能选择 topnav/sidebar/hybrid，不直接选择 blank。
  StandardName: StandardName
  // 完整 layout 对象声明，承接布局名称、固定策略、区域预设和 header/sidebar/content/footer 区域组合。
  Config: Config
  // `route.meta.layout` 的入口类型：普通页面写名称，复杂页面写完整对象。
  Declaration: Declaration
  // 布局运行时解析后的完整声明；区域预设、route.meta.layout 局部声明、默认值和用户偏好会先归一化到这里。
  ResolvedDeclaration: ResolvedLayout
  // 布局上下文，是布局库唯一的外部依赖入口；routes/settings/areas/tabs 都从这里进入。
  Context: Context
  // `LayoutRuntime.create()` 的插件参数；用于安装全局默认 context。
  PluginOptions: PluginOptions
  // 可持久化的用户偏好，包含主题、标准布局覆盖、导航展开方式和页面元素开关。
  Preferences: Preferences
  // 不持久化的运行态，包含设置面板开关和侧边栏当前模式。
  UiState: UiState
  // 布局设置入口配置；可被默认设置入口或业务自定义 addon 复用。
  Settings: Settings
  // 布局设置完整状态；调用方可以用 Pinia、localStorage 或其他 store 承担持久化，布局库只消费响应式对象。
  State: State
  // AppLayout 组件契约；根布局组件只接收一个可选 context，不直接耦合业务 Store。
  App: App
  // 区域契约；header/sidebar/content/footer 及其子区域都复用同一套区域模式、组件、addons 和 context。
  Area: Area
  // 顶部栏契约；覆盖完整 header 或 left/brand/center/right 子区。
  Header: Header
  // 侧边栏契约；覆盖完整 sidebar 或 header/content/footer 子区，并描述折叠策略与运行态。
  Sidebar: Sidebar
  // 内容区契约；覆盖主内容容器和 before/after 附加区。
  Content: Content
  // 底部栏契约；覆盖完整 footer 或 left/center/right 子区。
  Footer: Footer
  // 主题契约；只描述布局层需要的模式和主题色，不直接写业务样式。
  Theme: Theme
  // 菜单契约；由路由树派生，侧边栏和顶部导航共用同一结构。
  Menu: Menu
  // 路由契约；泛型用于项目扩展自己的 route meta，同时保留布局库消费字段。
  Route: Route<TMeta>
  // 页签契约；既描述内置已访问页签，也描述外部 tabs store adapter。
  Tabs: Tabs
}
