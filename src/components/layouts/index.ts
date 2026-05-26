import type { Layout } from '@/components/layouts/types/public'

export { default as AppLayout } from '@/components/layouts/components/App.vue'
export { default as LayoutSettings } from '@/components/layouts/components/common/settings/context/Content.vue'
export { default as LayoutSettingsTrigger } from '@/components/layouts/components/common/settings/Trigger.vue'
export { LayoutRuntime } from '@/components/layouts/runtime/api'
export type { Layout } from '@/components/layouts/types/public'

/** 单条布局路由记录；用于模块路由数组内的对象提示。 */
export type LayoutRouteRecord = Layout['Route']['RecordRaw']

/** 路由模块导出的标准数组类型；用于 export const xxxRoutes: LayoutRouteModule = [...]。 */
export type LayoutRouteModule = LayoutRouteRecord[]
