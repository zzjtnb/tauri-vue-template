import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import type { AffixItem, BreadcrumbItem } from '../types/internal'
import type { Layout } from '../types/public'

// Vue Router 子路由 path 可能是空串、相对路径或绝对路径；菜单生成前先统一成可导航的绝对路径。
function joinPath(parentPath: string, childPath: string): string {
  if (!childPath) {
    return parentPath || '/'
  }

  if (childPath.startsWith('/')) {
    return childPath
  }

  return `${parentPath || '/'}/${childPath}`.replace(/\/+/g, '/')
}

/** 可选参数路由在导航里指向稳定路径，例如 /chat/:sessionId? -> /chat。 */
export function navPath(routePath: string): string {
  const resolvedPath = routePath.replace(/\/:[^/]+\?/g, '')
  return resolvedPath || '/'
}

/** 当前导航激活路径从 matched 链最近可展示项推导，避免参数页高亮错位。 */
export function routeNavPath(currentRoute: RouteLocationNormalizedLoaded): string {
  const matchedRoute = [...currentRoute.matched]
    .reverse()
    .find((route) => {
      const meta = route.meta as Layout['Route']['Meta'] | undefined
      return Boolean(route.path && meta?.title && !meta.hidden)
    })

  return navPath(matchedRoute?.path || currentRoute.path)
}

function sortItems<T extends { order: number, title: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, 'zh-Hans-CN'))
}

function sortMenu(items: Layout['Menu']['Item'][]): Layout['Menu']['Item'][] {
  return sortItems(items).map(item => ({
    ...item,
    children: item.children ? sortMenu(item.children) : undefined,
  }))
}

// 把路由树转换为菜单树。无 title 的中间路由不会显示为菜单项，但它的可展示子路由会继续上浮。
function menuRoute(route: RouteRecordRaw, parentPath: string): Layout['Menu']['Item'][] {
  const meta = route.meta as Layout['Route']['Meta'] | undefined
  const path = joinPath(parentPath, route.path)

  if (meta?.hidden) {
    return []
  }

  const children = route.children?.flatMap(child => menuRoute(child, path)) ?? []
  if (!meta?.title) {
    return children
  }

  return [{
    name: String(route.name ?? path),
    path: navPath(path),
    externalLink: meta.externalLink,
    menuTarget: meta.menuTarget,
    alwaysShow: meta.alwaysShow,
    hideChildrenInMenu: meta.hideChildrenInMenu,
    title: meta.title,
    icon: meta.icon,
    order: Number(meta.order ?? 999),
    children: children.length > 0 ? children : undefined,
  }]
}

// 叶子菜单只精确匹配；父级分组可由任一子项或子路径命中激活，避免默认入口页在兄弟页面下误高亮。
export function isMenuActive(item: Layout['Menu']['Item'], currentPath: string): boolean {
  if (item.path && currentPath === item.path) {
    return true
  }

  if (item.children?.some(child => isMenuActive(child, currentPath))) {
    return true
  }

  return Boolean(item.children?.length && item.path && currentPath.startsWith(`${item.path}/`))
}

/** 处理 hideChildrenInMenu 和单子级提升，渲染组件只面对最终展示树。 */
export function displayMenu(items: Layout['Menu']['Item'][]): Layout['Menu']['Item'][] {
  return items.flatMap((item): Layout['Menu']['Item'][] => {
    const children = item.hideChildrenInMenu
      ? []
      : displayMenu(item.children ?? [])

    if (!item.alwaysShow && children.length === 1) {
      return [{
        ...children[0],
        icon: children[0].icon ?? item.icon,
      }]
    }

    return [{
      ...item,
      children: children.length > 0 ? children : undefined,
    }]
  })
}

export function menuItems(routes: RouteRecordRaw[]): Layout['Menu']['Item'][] {
  return sortMenu(routes.flatMap(route => menuRoute(route, '')))
}

// 面包屑优先使用 matched 链；如果当前路由没有可展示 matched 项，则用当前 route title 兜底。
export function breadcrumbs(options: {
  currentRoute: RouteLocationNormalizedLoaded
  fallbackTitle: string
}): BreadcrumbItem[] {
  const items = options.currentRoute.matched
    .map((route) => {
      const meta = route.meta as Layout['Route']['Meta'] | undefined
      if (!meta?.title || meta.breadcrumb === false) {
        return null
      }

      return {
        title: meta.title,
        path: navPath(route.path),
      } satisfies BreadcrumbItem
    })
    .filter((item): item is BreadcrumbItem => Boolean(item))

  if (items.length > 0) {
    return items
  }

  if (options.currentRoute.meta.breadcrumb === false || !options.fallbackTitle) {
    return []
  }

  return [{ title: options.fallbackTitle, path: options.currentRoute.path }]
}

// 固定页签从完整路由树递归收集，而不是从已访问页签里推导，保证 affix 页面在首次进入前也可见。
function affixRoute(route: RouteRecordRaw, parentPath: string, currentPath: string): AffixItem[] {
  const meta = route.meta as Layout['Route']['Meta'] | undefined
  const path = joinPath(parentPath, route.path)

  if (meta?.hidden) {
    return []
  }

  const children = route.children?.flatMap(child => affixRoute(child, path, currentPath)) ?? []
  if (!meta?.title || !meta.affix) {
    return children
  }

  const affixPath = navPath(path)

  return [{
    name: String(route.name ?? path),
    title: meta.title,
    path: affixPath,
    order: Number(meta.order ?? 999),
    isActive: currentPath === affixPath,
  }, ...children]
}

export function affixItems(options: { routes: RouteRecordRaw[], currentPath: string }): AffixItem[] {
  return sortItems(options.routes.flatMap(route => affixRoute(route, '', options.currentPath)))
}
