import type { Component } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { ResolvedArea } from '../types/internal'

/** 当前区域是否存在自定义来源；false 模式必须压住 slot、命名视图和配置组件。 */
export interface AreaSources {
  slot?: boolean
  view?: boolean
  component?: boolean
}

export interface RenderOptions {
  /** auto 无自定义来源时是否回退默认内容。footer 等可选区域应传 false。 */
  autoDefault?: boolean
  /** custom 无自定义来源时是否仍挂载 AreaOutlet，以便渲染空内容并触发开发期警告。 */
  customPlaceholder?: boolean
}

export type SlotMap = Record<string, unknown>
export type NamedView = Component | (() => Promise<Component>)

interface AreaSource {
  hasView: (name: string) => boolean
  hasSource: (config: ResolvedArea, viewName: string, slotName: string) => boolean
  hasCustom: (config: ResolvedArea, viewName: string, slotName: string) => boolean
  shouldRender: (config: ResolvedArea, viewName: string, slotName: string, options?: RenderOptions) => boolean
}

// 从 matched 链末端向前找命名视图：子路由声明应覆盖父路由声明，这与 Vue Router 的嵌套路由直觉一致。
export function resolveNamedView(route: RouteLocationNormalizedLoaded, name: string): NamedView | undefined {
  const matchedRecord = [...route.matched]
    .reverse()
    .find(record => Boolean(record.components?.[name]))

  return matchedRecord?.components?.[name] as NamedView | undefined
}

// 为某个 AppLayout/区域组件创建来源解析器。调用方只传当前 route 和 slots，后续所有区域共用同一套判断规则。
export function createAreaSource(route: RouteLocationNormalizedLoaded, slots: SlotMap): AreaSource {
  const slot = (name: string) => Boolean(slots[name])
  const view = (name: string) => Boolean(resolveNamedView(route, name))
  const sources = (config: ResolvedArea, viewName: string, slotName: string): AreaSources => ({
    slot: slot(slotName),
    view: view(viewName),
    component: Boolean(config.component),
  })

  return {
    hasView: view,
    hasSource: (config, viewName, slotName) => hasSource(config, sources(config, viewName, slotName)),
    hasCustom: (config, viewName, slotName) => hasCustom(config, sources(config, viewName, slotName)),
    shouldRender: (config, viewName, slotName, options = {}) => shouldRender(config, sources(config, viewName, slotName), options),
  }
}

export function hasAddons(config: ResolvedArea): boolean {
  return config.addons.before.length > 0 || config.addons.after.length > 0
}

// 可选区域只在 custom、外部来源或 addons 存在时渲染；footer 这类默认可选区复用同一规则。
export function hasCustom(config: ResolvedArea, sources: AreaSources = {}): boolean {
  if (config.mode === false) {
    return false
  }

  return config.mode === 'custom' || hasSource(config, sources) || hasAddons(config)
}

// 自定义来源包括 slot、命名视图和 layout 配置组件；mode=false 永远优先，防止禁用区域被外部来源重新打开。
export function hasSource(config: ResolvedArea, sources: AreaSources = {}): boolean {
  if (config.mode === false) {
    return false
  }

  return Boolean(
    sources.slot
    || sources.view
    || sources.component
    || config.component,
  )
}

// 区域是否挂载的最终规则：先看禁用和自定义来源，再按 default/auto/custom 的语义决定是否回退默认内容。
export function shouldRender(config: ResolvedArea, sources: AreaSources = {}, options: RenderOptions = {}): boolean {
  if (config.mode === false) {
    return false
  }

  if (hasSource(config, sources) || hasAddons(config)) {
    return true
  }

  if (config.mode === 'default') {
    return true
  }

  if (config.mode === 'auto') {
    return options.autoDefault ?? true
  }

  if (config.mode === 'custom') {
    return options.customPlaceholder ?? true
  }

  return false
}

// 默认内容只在没有任何自定义来源时才会被调用；AreaOutlet 用它避免自定义内容和默认 UI 同时渲染。
export function shouldRenderDefault(config: ResolvedArea, options: Pick<RenderOptions, 'autoDefault'> = {}): boolean {
  if (config.mode === 'default') {
    return true
  }

  if (config.mode === 'auto') {
    return options.autoDefault ?? true
  }

  return false
}
