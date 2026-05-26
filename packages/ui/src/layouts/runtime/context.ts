import type { App, InjectionKey, MaybeRefOrGetter, Plugin } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import type { Layout } from '../types/public'
import { computed, inject, reactive, shallowRef, toValue, watch } from 'vue'
import { routeNavPath } from '../utils/menu'
import { defaultLayoutState } from './defaults'

const contextKey = Symbol('layouts.context') as InjectionKey<Layout['Context']>
const storageKey = `${import.meta.env.VITE_STORE_KEY_PREFIX?.trim() || 'layouts'}:layouts:preferences`
let customContext: Layout['Context'] | undefined

// 内置上下文服务于零配置使用场景；高级宿主传入 Layout['Context'] 后会覆盖它。
// 这里的状态必须保持布局库内部自洽，不能引用任何业务 Store。
const builtInState = reactive<Layout['State']>(createState())
const visitedTabs = shallowRef<Layout['Tabs']['Visited'][]>([])
const cachedTabs = shallowRef<string[]>([])
const visibleTabs = computed(() => visitedTabs.value.filter(view => !view.path.startsWith('/redirect')))
const cachedTabSet = computed(() => new Set(cachedTabs.value))

const builtInTabs: Layout['Tabs']['Context'] = {
  visibleViews: visibleTabs,
  cachedViews: cachedTabs,
  cachedViewSet: cachedTabSet,
  addRouteView,
  delView,
  delOtherViews,
  delLeftViews,
  delRightViews,
  delAllViews,
  updateVisitedView,
}

// 只持久化 preferences，ui 运行态例如设置面板打开态和侧边栏模式不写入本地存储。
watch(() => builtInState.preferences, preferences => writePrefs(preferences), { deep: true })

/**
 * 创建布局库插件。
 *
 * AppLayout 默认自带 routes/settings/tabs 上下文；该插件只服务于高级宿主覆盖默认上下文，
 * 不再是项目接入必需步骤。options.context 在 install 阶段只读取一次。
 */
export function createLayouts(options: Layout['PluginOptions'] = {}): Plugin {
  return {
    install(app: App) {
      const context = options.context ? toValue(options.context) : undefined
      if (context) {
        setDefaultContext(context)
        app.provide(contextKey, context)
      }
    },
  }
}

/** 设置默认布局上下文；高级宿主可覆盖库内自动上下文，普通路由使用不需要调用。 */
export function setDefaultContext(context: Layout['Context']): void {
  customContext = context
}

/** 获取默认布局上下文；未显式设置时使用 layouts 内部状态、内置 tabs 和传入的路由树。 */
export function getDefaultContext(routes: MaybeRefOrGetter<RouteRecordRaw[]> = []): Layout['Context'] {
  return customContext ?? {
    routes,
    settings: builtInState,
    tabs: builtInTabs,
  }
}

/** 清理 layouts 内置页签；高级宿主传入自定义 tabs 时应自行清理。 */
export function clearTabs(): void {
  delAllViews()
}

/** 注入布局上下文；AppLayout 内部优先读取 props.context，其次读取这里的全局/局部 provider。 */
export function injectContext(): Layout['Context'] | undefined {
  return inject(contextKey, undefined)
}

function createState(): Layout['State'] {
  const state = structuredClone(defaultLayoutState)
  state.preferences = mergePrefs(state.preferences, readPrefs())
  return state
}

// 按层合并偏好，避免持久化数据缺少新增字段时把默认配置覆盖成 undefined。
function mergePrefs(base: Layout['Preferences'], override: Partial<Layout['Preferences']> | undefined): Layout['Preferences'] {
  if (!override) {
    return base
  }

  return {
    ...base,
    ...override,
    theme: {
      ...base.theme,
      ...override.theme,
    },
    navigation: {
      sidebar: {
        ...base.navigation.sidebar,
        ...override.navigation?.sidebar,
      },
      topnav: {
        ...base.navigation.topnav,
        ...override.navigation?.topnav,
      },
    },
    pageElements: {
      ...base.pageElements,
      ...override.pageElements,
    },
  }
}

function readPrefs(): Partial<Layout['Preferences']> | undefined {
  if (typeof localStorage === 'undefined') {
    return undefined
  }

  try {
    const rawValue = localStorage.getItem(storageKey)
    return rawValue ? JSON.parse(rawValue) as Partial<Layout['Preferences']> : undefined
  }
  catch {
    return undefined
  }
}

function writePrefs(preferences: Layout['Preferences']): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences))
  }
  catch {
    if (import.meta.env.DEV) {
      console.warn('[layouts] 写入布局偏好失败，已跳过本次持久化。')
    }
  }
}

// 内置 tabs 只记录可展示路由；hidden、redirect、无 title 的路由不会进入页签栏。
function toTab(route: RouteLocationNormalizedLoaded): Layout['Tabs']['Visited'] | null {
  const meta = route.meta as Layout['Route']['Meta'] | undefined
  if (route.path.startsWith('/redirect') || meta?.hidden || !meta?.title) {
    return null
  }

  return {
    name: route.name,
    title: meta.title,
    path: routeNavPath(route),
    fullPath: route.fullPath,
    affix: Boolean(meta.affix),
    keepAlive: Boolean(meta.keepAlive),
  }
}

// path 是页签去重键，使用导航归一化路径而不是当前实际 path。
// 例如 /:sessionId? 当前可能解析成 /a、/b，但它们都属于 AI Chat 这个导航入口，页签栏只能保留一个。
function addRouteView(route: RouteLocationNormalizedLoaded): void {
  const view = toTab(route)
  if (!view) {
    return
  }

  const existingView = visitedTabs.value.find(item => item.path === view.path)
  if (existingView) {
    visitedTabs.value = visitedTabs.value.map(item => item.path === view.path ? { ...item, ...view } : item)
    updateCache(existingView, view)
    return
  }

  visitedTabs.value = view.affix ? [view, ...visitedTabs.value] : [...visitedTabs.value, view]
  if (view.keepAlive && !cachedTabs.value.includes(view.fullPath)) {
    cachedTabs.value = [...cachedTabs.value, view.fullPath]
  }
}

function updateCache(previousView: Layout['Tabs']['Visited'], nextView: Layout['Tabs']['Visited']): void {
  const nextCachedTabs = cachedTabs.value.filter(item => item !== previousView.fullPath)
  cachedTabs.value = nextView.keepAlive && !nextCachedTabs.includes(nextView.fullPath)
    ? [...nextCachedTabs, nextView.fullPath]
    : nextCachedTabs
}

function delView(view: Layout['Tabs']['Visited']): void {
  visitedTabs.value = visitedTabs.value.filter(item => item.path !== view.path)
  cachedTabs.value = cachedTabs.value.filter(item => item !== view.fullPath)
}

function delOtherViews(view: Layout['Tabs']['Visited']): void {
  visitedTabs.value = visitedTabs.value.filter(item => item.affix || item.path === view.path)
  cachedTabs.value = cachedTabs.value.includes(view.fullPath) ? [view.fullPath] : []
}

function delLeftViews(view: Layout['Tabs']['Visited']): void {
  const currentIndex = visitedTabs.value.findIndex(item => item.path === view.path)
  if (currentIndex < 0) {
    return
  }

  const removedViews = visitedTabs.value.slice(0, currentIndex).filter(item => !item.affix)
  visitedTabs.value = visitedTabs.value.filter((item, index) => item.affix || index >= currentIndex)
  cachedTabs.value = cachedTabs.value.filter(fullPath => !removedViews.some(item => item.fullPath === fullPath))
}

function delRightViews(view: Layout['Tabs']['Visited']): void {
  const currentIndex = visitedTabs.value.findIndex(item => item.path === view.path)
  if (currentIndex < 0) {
    return
  }

  const removedViews = visitedTabs.value.slice(currentIndex + 1).filter(item => !item.affix)
  visitedTabs.value = visitedTabs.value.filter((item, index) => item.affix || index <= currentIndex)
  cachedTabs.value = cachedTabs.value.filter(fullPath => !removedViews.some(item => item.fullPath === fullPath))
}

function delAllViews(): void {
  visitedTabs.value = visitedTabs.value.filter(item => item.affix)
  cachedTabs.value = []
}

function updateVisitedView(view: Layout['Tabs']['Visited']): void {
  const target = visitedTabs.value.find(item => item.path === view.path)
  if (target) {
    Object.assign(target, view)
  }
}
