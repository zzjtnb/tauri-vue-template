import type { RenderContext, ResolvedArea } from '@/components/layouts/types/internal'
import type { Layout } from '@/components/layouts/types/public'
import { computed, toValue, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@/components/layouts/composables/useMediaQuery'
import { getDefaultContext, injectContext } from '@/components/layouts/runtime/context'
import { isStandard, themeColors } from '@/components/layouts/runtime/defaults'
import { createAreaSource } from '@/components/layouts/utils/area'
import { resolveLayout } from '@/components/layouts/utils/layout'
import { menuItems as buildMenu, displayMenu, routeNavPath } from '@/components/layouts/utils/menu'

/**
 * 汇总 AppLayout 的运行时状态。
 * 这里是布局库的“适配边界”：只读取 Layout['Context']、route.meta.layout 和 slots，不导入任何业务 Store 或业务路由模块。
 */
export function useRuntime(props: Layout['App']['Props'], slots: Record<string, unknown>) {
  const route = useRoute()
  const router = useRouter()
  const provided = injectContext()
  const defaultRoutes = computed(() => [...router.options.routes])
  const mobile = useMediaQuery('(max-width: 767.98px)', false)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)', false)
  const areaSource = createAreaSource(route, slots)

  // 上下文来源优先级：显式 props > provide/plugin > 内置默认上下文。
  // 这让普通应用可以零配置使用，高级宿主仍能完整替换 routes/settings/areas/tabs。
  const source = computed(() => props.context ?? provided ?? getDefaultContext(defaultRoutes))
  const settings = computed(() => source.value.settings)
  const routes = computed(() => toValue(source.value.routes) ?? [])
  // 主题同步是布局库唯一写入 DOM 的副作用，集中在运行时处理，区域组件只消费最终 context。
  watchEffect(() => syncDocumentTheme(settings.value.preferences.theme, systemDark.value))
  const areas = computed(() => source.value.areas ?? {})
  const tabs = computed(() => source.value.tabs)
  const routeMeta = computed(() => route.meta as Layout['Route']['Meta'] | undefined)
  const layoutInput = computed(() => routeMeta.value?.layout)
  const fixed = computed(() => layoutFixed(layoutInput.value))
  // 用户布局偏好只覆盖未 fixed 的标准布局；blank 默认 fixed，但完整 layout 对象可用 fixed:false 显式取消。
  const layout = computed(() => resolveLayout(
    layoutInput.value,
    areas.value,
    settings.value.preferences.layoutMode,
    fixed.value,
  ))
  const layoutName = computed(() => layout.value.name)
  const standard = computed(() => isStandard(layoutName.value))
  const activePath = computed(() => routeNavPath(route))
  const menu = computed(() => displayMenu(buildMenu(routes.value)))
  const title = computed(() => `${(route.meta as Layout['Route']['Meta'] | undefined)?.title ?? 'App'}`)
  const elements = computed(() => settings.value.preferences.pageElements)
  // collapseMode=auto 根据视口映射为实际渲染策略：桌面保留 rail，移动端直接隐藏，避免窄屏内容被侧栏挤压。
  const collapseMode = computed(() => {
    const mode = settings.value.preferences.navigation.sidebar.collapseMode
    if (mode !== 'auto') {
      return mode
    }

    return mobile.value ? 'hidden' : 'rail'
  })
  const sidebarMode = computed(() => settings.value.ui.sidebar.mode)
  const sidebarCollapsed = computed(() => sidebarMode.value === 'collapsed')
  const sidebarHidden = computed(() => sidebarMode.value === 'hidden')
  const sidebarVisible = computed(() => sidebarMode.value !== 'hidden')
  const rail = computed(() => sidebarMode.value === 'collapsed' && collapseMode.value === 'rail')
  const renderHidden = computed(() => sidebarHidden.value || (sidebarMode.value === 'collapsed' && collapseMode.value === 'hidden'))
  const usesSidebar = computed(() => layoutName.value === 'sidebar'
    || layoutName.value === 'hybrid'
    || (mobile.value && layoutName.value === 'topnav'))

  /**
   * 自定义区域组件唯一能拿到的布局能力对象。
   * collapsed/hidden/visible 都是 mode 的派生值，写入只能通过 setMode/toggle/close 等显式动作发生。
   */
  const areaContext = computed<Layout['Area']['Context']>(() => ({
    layout: {
      name: layoutName.value,
      declaration: layout.value,
    },
    route,
    viewport: {
      mobile: mobile.value,
    },
    sidebar: {
      mode: sidebarMode.value,
      collapsed: sidebarCollapsed.value,
      hidden: sidebarHidden.value,
      visible: sidebarVisible.value,
      toggle: toggleSidebar,
      close: closeSidebar,
      expand: expandSidebar,
      collapse: collapseSidebar,
      setMode: setSidebarMode,
    },
    settings: {
      open: settings.value.ui.settings.open,
      show: showSettings,
      hide: hideSettings,
      toggle: toggleSettings,
    },
  }))

  const showHeader = computed(() => standard.value && showArea(layout.value.header, 'layout-header', 'header'))
  const showSidebar = computed(() => standard.value
    && usesSidebar.value
    && !renderHidden.value
    && showArea(layout.value.sidebar, 'layout-sidebar', 'sidebar'))
  // footer 默认是可选区域：整区、任一子区存在自定义来源时才渲染，避免普通页面出现空底栏。
  const showFooter = computed(() => {
    const footer = layout.value.footer
    if (!standard.value || footer.mode === false) {
      return false
    }

    return showArea(footer, 'layout-footer', 'footer', false)
      || areaSource.hasCustom(footer.left, 'layout-footer-left', 'footer-left')
      || areaSource.hasCustom(footer.center, 'layout-footer-center', 'footer-center')
      || areaSource.hasCustom(footer.right, 'layout-footer-right', 'footer-right')
  })

  // 内部组件只接收 RenderContext，不再暴露一串散 computed；这是布局渲染层的稳定对象化契约。
  const runtime = computed<RenderContext>(() => ({
    context: areaContext.value,
    layout: layout.value,
    routes: routes.value,
    settings: settings.value,
    tabs: tabs.value,
    navigation: {
      items: menu.value,
      activePath: activePath.value,
      menuMode: {
        sidebar: settings.value.preferences.navigation.sidebar.menuMode,
        topnav: settings.value.preferences.navigation.topnav.menuMode,
      },
    },
    elements: {
      tabs: elements.value.tabs,
      breadcrumb: elements.value.breadcrumb,
      headerFixed: elements.value.headerFixed,
      footerFixed: elements.value.footerFixed,
    },
    page: {
      title: title.value,
    },
    shell: {
      isStandardLayout: standard.value,
      shouldRenderHeader: showHeader.value,
      shouldRenderSidebar: showSidebar.value,
      shouldRenderFooter: showFooter.value,
      renderSidebarAsRail: rail.value,
    },
  }))

  /** 写入侧边栏唯一真实运行态；其它可见性字段都必须从 mode 派生。 */
  function setSidebarMode(mode: Layout['Sidebar']['Mode']): void {
    settings.value.ui.sidebar.mode = mode
  }

  function closeSidebar(): void {
    setSidebarMode('hidden')
  }

  function expandSidebar(): void {
    setSidebarMode('expanded')
  }

  function collapseSidebar(): void {
    setSidebarMode('collapsed')
  }

  // 同一个 toggle 在移动端和桌面端语义不同：移动端是显示/隐藏抽屉，桌面端是展开/折叠 rail。
  function toggleSidebar(): void {
    if (mobile.value) {
      setSidebarMode(sidebarHidden.value ? 'expanded' : 'hidden')
      return
    }

    setSidebarMode(sidebarCollapsed.value ? 'expanded' : 'collapsed')
  }

  function layoutFixed(input: Layout['Declaration'] | undefined): boolean {
    return typeof input === 'object'
      ? input.fixed ?? input.name === 'blank'
      : input === 'blank'
  }

  function showSettings(): void {
    settings.value.ui.settings.open = true
  }

  function hideSettings(): void {
    settings.value.ui.settings.open = false
  }

  function toggleSettings(): void {
    settings.value.ui.settings.open = !settings.value.ui.settings.open
  }

  function showArea(config: ResolvedArea, viewName: string, slotName: string, autoDefault = true): boolean {
    return areaSource.shouldRender(config, viewName, slotName, {
      autoDefault,
      customPlaceholder: true,
    })
  }

  // 视口切换时修正运行态：移动端展开态会挡住内容，桌面端隐藏态会丢失主导航入口。
  watch(mobile, (isMobile) => {
    if (isMobile && settings.value.ui.sidebar.mode === 'expanded') {
      closeSidebar()
      return
    }

    if (!isMobile && settings.value.ui.sidebar.mode === 'hidden') {
      expandSidebar()
    }
  }, { immediate: true })

  // 路由变化由布局层通知 tabs 上下文；是否忽略 hidden/redirect 等规则由上下文实现决定。
  watch(() => route.fullPath, () => {
    tabs.value?.addRouteView(route)
    if (mobile.value) {
      closeSidebar()
    }
  }, { immediate: true })

  return {
    runtime,
  }
}

// 主题 class 同步到 documentElement：mode 控制 dark，color 控制主题色 token。SSR 或测试环境没有 document 时直接跳过。
function syncDocumentTheme(theme: { mode: 'system' | 'light' | 'dark', color: string }, systemDark: boolean): void {
  if (typeof document === 'undefined') {
    return
  }

  const dark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.remove(...themeColors)
  document.documentElement.classList.add(theme.color)
}
