<script setup lang="ts">
import type { RenderContext, ResolvedArea } from '../../types/internal'
import type { Layout } from '../../types/public'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createAreaSource } from '../../utils/area'
import AreaOutlet from '../common/AreaOutlet.vue'
import HeaderCenter from './Center.vue'
import HeaderLeft from './Left.vue'

const props = defineProps<{
  runtime: RenderContext
}>()

const slots = defineSlots<{
  'header'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-left'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-brand'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-center'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-right'?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

const route = useRoute()
const header = computed(() => props.runtime.layout.header)
const context = computed(() => props.runtime.context)
const areaSource = createAreaSource(route, slots as Record<string, unknown>)
const partVisible = computed(() => ({
  left: showArea(header.value.left, 'layout-header-left', 'header-left'),
  brand: showArea(header.value.brand, 'layout-header-brand', 'header-brand'),
  center: showArea(header.value.center, 'layout-header-center', 'header-center'),
  right: showArea(header.value.right, 'layout-header-right', 'header-right'),
}))
// 移动端 topnav 也需要侧边栏入口，否则窄屏下没有主导航入口。
const usesSidebar = computed(() => context.value.layout.name === 'sidebar'
  || context.value.layout.name === 'hybrid'
  || (context.value.viewport.mobile && context.value.layout.name === 'topnav'))

function showArea(config: ResolvedArea, viewName: string, slotName: string): boolean {
  return areaSource.shouldRender(config, viewName, slotName)
}
</script>

<template>
  <AreaOutlet
    name="layout-header"
    :config="header"
    :context="context"
    :slot-provided="Boolean(slots.header)"
    :route-view-available="areaSource.hasView('layout-header')"
  >
    <template v-if="slots.header" #custom="slotProps">
      <slot name="header" :context="slotProps.context" />
    </template>

    <template #default>
      <div class="h-header px-4 border-b border-border flex gap-4 min-w-0 items-center justify-between" :class="header.class">
        <div v-if="partVisible.left" aria-label="顶部栏起始区域" class="flex flex-1 min-w-0 items-center" :class="header.left.class">
          <AreaOutlet
            name="layout-header-left"
            :config="header.left"
            :context="context"
            :slot-provided="Boolean(slots['header-left'])"
            :route-view-available="areaSource.hasView('layout-header-left')"
          >
            <template v-if="slots['header-left']" #custom="slotProps">
              <slot name="header-left" :context="slotProps.context" />
            </template>
            <template #default>
              <HeaderLeft v-if="partVisible.brand || usesSidebar" :runtime="runtime">
                <template v-if="slots['header-brand']" #brand="slotProps">
                  <slot name="header-brand" :context="slotProps.context" />
                </template>
              </HeaderLeft>
            </template>
          </AreaOutlet>
        </div>

        <div v-if="partVisible.center" aria-label="顶部栏导航区域" class="flex-[2] min-w-0" :class="header.center.class">
          <AreaOutlet
            name="layout-header-center"
            :config="header.center"
            :context="context"
            :slot-provided="Boolean(slots['header-center'])"
            :route-view-available="areaSource.hasView('layout-header-center')"
          >
            <template v-if="slots['header-center']" #custom="slotProps">
              <slot name="header-center" :context="slotProps.context" />
            </template>
            <template #default>
              <HeaderCenter :runtime="runtime" />
            </template>
          </AreaOutlet>
        </div>

        <div v-if="partVisible.right" aria-label="顶部栏操作区域" class="flex flex-1 gap-2 min-w-0 items-center justify-end" :class="header.right.class">
          <AreaOutlet
            name="layout-header-right"
            :config="header.right"
            :context="context"
            :slot-provided="Boolean(slots['header-right'])"
            :route-view-available="areaSource.hasView('layout-header-right')"
          >
            <template v-if="slots['header-right']" #custom="slotProps">
              <slot name="header-right" :context="slotProps.context" />
            </template>
            <template #default>
              <span class="sr-only">顶部栏操作区</span>
            </template>
          </AreaOutlet>
        </div>
      </div>
    </template>
  </AreaOutlet>
</template>
