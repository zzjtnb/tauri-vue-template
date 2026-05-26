import type { MaybeRefOrGetter } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { Layout } from '../types/public'
import { clearTabs, createLayouts, getDefaultContext, injectContext, setDefaultContext } from './context'
import { defaultLayoutState } from './defaults'
import { defineContent, defineRoutes } from './routes'

/**
 * 布局系统运行时公共入口。
 *
 * 类型根对象叫 `Layout`，通过 `export type { Layout }` 暴露；运行时对象不能复用同名导出，避免使用者混淆类型和值。
 */
function useContext(routes: MaybeRefOrGetter<RouteRecordRaw[]> = []): Layout['Context'] {
  return injectContext() ?? getDefaultContext(routes)
}

export const LayoutRuntime = {
  // 创建布局插件，安装时读取一次全局默认 context 并提供给 AppLayout；局部 props.context 仍可覆盖它。
  create: createLayouts,
  // 根据模块化路由导出生成带 AppLayout 壳的路由树；publicRoutes 留在壳外，业务 Routes 放到 children 中。
  defineRoutes,
  // 生成 default + layout-content 命名视图映射，用于页面整页接管内容区，避免使用者手写命名视图字符串。
  defineContent,
  // 只读默认布局状态；调用方应 structuredClone 后再放进 reactive/store，避免污染库级常量。
  defaultState: defaultLayoutState,
  // 布局 context 入口；普通页面用 use()，应用启动或插件安装阶段才需要 set()。
  context: {
    // 读取全局默认 context；未设置时会用内置状态、内置 tabs 和传入 routes 构造兜底上下文。
    get: getDefaultContext,
    // 在组件 setup 中读取最近的布局 context；没有 provider 时回退默认 context。
    use: useContext,
    // 设置全局默认布局 context，通常由 LayoutRuntime.create() 间接调用。
    set: setDefaultContext,
  },
  // 内置页签运行时入口；只管理布局库内部轻量页签，自定义 tabs adapter 应由外部 store 自己清理。
  tabs: {
    // 清理内置已访问页签和缓存列表；用户退出登录或切换身份时调用。
    clear: clearTabs,
  },
} as const
