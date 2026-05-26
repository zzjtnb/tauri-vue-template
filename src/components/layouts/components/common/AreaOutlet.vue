<script setup lang="ts">
import type { AsyncComponentLoader, Component } from 'vue'
import type { ResolvedAddon, ResolvedArea } from '@/components/layouts/types/internal'
import type { Layout } from '@/components/layouts/types/public'
import { computed, defineAsyncComponent } from 'vue'
import { shouldRender as canRender, shouldRenderDefault as canRenderDefault, hasSource, resolveNamedView } from '@/components/layouts/utils/area'

const props = withDefaults(defineProps<{
  /** Vue Router 命名视图名称，例如 layout-header-brand。 */
  name: string
  /** 解析后的区域配置。 */
  config: ResolvedArea
  /** 传给所有自定义区域组件的统一上下文。 */
  context: Layout['Area']['Context']
  /** AppLayout 显式 slot 是否存在；slot 优先级最高。 */
  slotProvided?: boolean
  /** 当前 route.matched 中是否存在对应命名视图。 */
  routeViewAvailable?: boolean
  /** auto 无自定义内容时是否回退默认内容；footer 这类可选区传 false。 */
  autoDefault?: boolean
}>(), {
  slotProvided: false,
  routeViewAvailable: false,
  autoDefault: true,
})

defineSlots<{
  custom?: (props: { context: Layout['Area']['Context'] }) => unknown
  default?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

type RenderableAddon = ResolvedAddon & {
  component: Component
  wrap: boolean
}

function toComponent(component: ResolvedAddon['component'] | undefined): Component | undefined {
  if (!component) {
    return undefined
  }

  if (typeof component === 'function') {
    return defineAsyncComponent(component as AsyncComponentLoader<Component>)
  }

  return component
}

function areaPos(name: string): Pick<NonNullable<Layout['Area']['Context']['area']>, 'region' | 'part'> {
  const [region = name, ...partSegments] = name.replace(/^layout-/, '').split('-')
  return {
    region,
    part: partSegments.join('-') || region,
  }
}

function toAddons(addons: ResolvedAddon[]): RenderableAddon[] {
  return addons.flatMap((addon) => {
    const component = toComponent(addon.component)
    if (!component) {
      return []
    }

    return [{
      ...addon,
      component,
      wrap: Boolean(addon.class || addon.label),
    }]
  })
}

/**
 * 区域组件可以是普通 Vue component，也可以是 () => import(...) 的异步加载器。
 * 当前项目区域注册表使用异步加载器；这里统一包装后交给动态组件渲染。
 */
const configComponent = computed<Component | undefined>(() => toComponent(props.config.component))

// 命名视图由 Vue Router 当前 matched 链决定。这里保持惰性解析，让 AreaOutlet 统一处理完整区域和子区域覆盖。
const viewComponent = computed<Component | undefined>(() => toComponent(resolveNamedView(props.context.route, props.name)))
const hasRouteComponent = computed(() => props.routeViewAvailable && Boolean(viewComponent.value))
// 区域来源状态是渲染判断的唯一输入：slot、命名视图、配置组件都属于“自定义来源”。
// mode=false 会在 utils/area.ts 中统一压住所有来源，避免禁用区域被 slot 意外唤醒。
const sources = computed(() => ({
  slot: props.slotProvided,
  view: hasRouteComponent.value,
  component: Boolean(configComponent.value),
}))
const hasCustom = computed(() => hasSource(props.config, sources.value))
// 给当前 outlet 注入 area 元信息；自定义组件无需知道自己来自 slot、命名视图还是 meta 内联组件。
const outlet = computed<Layout['Area']['Context']>(() => ({
  ...props.context,
  area: {
    name: props.name,
    label: props.config.label,
    mode: props.config.mode,
    ...areaPos(props.name),
  },
}))
const addonGroups = computed(() => [
  { side: 'before', items: toAddons(props.config.addons.before) },
  { side: 'after', items: toAddons(props.config.addons.after) },
])
const hasAddons = computed(() => addonGroups.value.some(group => group.items.length > 0))

// 只有没有任何自定义来源时才允许回退默认内容，保证 custom/命名视图/slot 不会和默认 UI 混渲。
const renderDefault = computed(() => !hasCustom.value && canRenderDefault(props.config, {
  autoDefault: props.autoDefault,
}))
const renderOutlet = computed(() => canRender(props.config, sources.value, {
  autoDefault: props.autoDefault,
  customPlaceholder: true,
}))

if (import.meta.env.DEV && props.config.mode === 'custom' && !hasCustom.value && !hasAddons.value) {
  console.warn(`[layouts] 区域 ${props.name} 声明为 custom，但没有提供 slot、命名视图、组件或 addons。`)
}
</script>

<template>
  <template v-if="renderOutlet">
    <template v-for="group in addonGroups" :key="group.side">
      <template v-if="group.side === 'after'">
        <!-- 来源优先级：显式 slot > 路由命名视图 > layout 配置组件 > 默认内容。 -->
        <slot v-if="slotProvided" name="custom" :context="outlet" />
        <component :is="viewComponent" v-else-if="viewComponent" :context="outlet" />
        <component :is="configComponent" v-else-if="configComponent" :context="outlet" />
        <slot v-else-if="renderDefault" :context="outlet" />
      </template>

      <template v-for="(addon, addonIndex) in group.items" :key="`${group.side}-${addonIndex}`">
        <div v-if="addon.wrap" :aria-label="addon.label" :class="addon.class">
          <component :is="addon.component" v-bind="addon.props" :context="outlet" />
        </div>
        <component :is="addon.component" v-else v-bind="addon.props" :context="outlet" />
      </template>
    </template>
  </template>
</template>
