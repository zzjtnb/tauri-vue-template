<script setup lang="ts">
import type { RenderContext, ResolvedArea } from '@/components/layouts/types/internal'
import type { Layout } from '@/components/layouts/types/public'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AreaOutlet from '@/components/layouts/components/common/AreaOutlet.vue'
import { createAreaSource } from '@/components/layouts/utils/area'

const props = defineProps<{
  runtime: RenderContext
}>()

const slots = defineSlots<{
  'footer'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-left'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-center'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-right'?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

const route = useRoute()
const footer = computed(() => props.runtime.layout.footer)
const context = computed(() => props.runtime.context)
const areaSource = createAreaSource(route, slots as Record<string, unknown>)

// 完整 footer 覆盖优先于 left/center/right 组合，避免整区内容和子区默认内容混渲。
const wholeVisible = computed(showWhole)
const partVisible = computed(() => ({
  left: showPart(footer.value.left, 'layout-footer-left', 'footer-left'),
  center: showPart(footer.value.center, 'layout-footer-center', 'footer-center'),
  right: showPart(footer.value.right, 'layout-footer-right', 'footer-right'),
}))
const partsVisible = computed(showParts)

function showWhole(): boolean {
  return areaSource.shouldRender(footer.value, 'layout-footer', 'footer', {
    autoDefault: false,
    customPlaceholder: true,
  }) && areaSource.hasCustom(footer.value, 'layout-footer', 'footer')
}

// auto footer 只有在子区存在自定义来源时才渲染；default footer 才渲染内置左右中区域。
function showParts(): boolean {
  if (footer.value.mode === false) {
    return false
  }
  if (footer.value.mode === 'default') {
    return true
  }
  if (footer.value.mode !== 'auto') {
    return false
  }

  return partVisible.value.left || partVisible.value.center || partVisible.value.right
}

function showPart(config: ResolvedArea, viewName: string, slotName: string): boolean {
  if (footer.value.mode === 'default') {
    return areaSource.shouldRender(config, viewName, slotName)
  }

  if (footer.value.mode !== 'auto' || config.mode === false) {
    return false
  }

  return areaSource.hasCustom(config, viewName, slotName)
}
</script>

<template>
  <footer :aria-label="footer.label" class="border-t border-border shrink-0" :class="footer.class">
    <AreaOutlet
      v-if="wholeVisible"
      name="layout-footer"
      :config="footer"
      :context="context"
      :slot-provided="Boolean(slots.footer)"
      :route-view-available="areaSource.hasView('layout-footer')"
      :auto-default="false"
    >
      <template v-if="slots.footer" #custom="slotProps">
        <slot name="footer" :context="slotProps.context" />
      </template>
    </AreaOutlet>

    <div v-else-if="partsVisible" class="min-h-footer text-sm text-muted-foreground px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div v-if="partVisible.left" aria-label="底部栏左区" class="flex min-w-0 items-center" :class="footer.left.class">
        <AreaOutlet
          name="layout-footer-left"
          :config="footer.left"
          :context="context"
          :slot-provided="Boolean(slots['footer-left'])"
          :route-view-available="areaSource.hasView('layout-footer-left')"
        >
          <template v-if="slots['footer-left']" #custom="slotProps">
            <slot name="footer-left" :context="slotProps.context" />
          </template>
          <template #default>
            <span class="sr-only">布局底部栏</span>
          </template>
        </AreaOutlet>
      </div>

      <div v-if="partVisible.center" aria-label="底部栏中区" class="flex min-w-0 items-center justify-center" :class="footer.center.class">
        <AreaOutlet
          name="layout-footer-center"
          :config="footer.center"
          :context="context"
          :slot-provided="Boolean(slots['footer-center'])"
          :route-view-available="areaSource.hasView('layout-footer-center')"
        >
          <template v-if="slots['footer-center']" #custom="slotProps">
            <slot name="footer-center" :context="slotProps.context" />
          </template>
          <template #default>
            <span class="sr-only">布局底部栏</span>
          </template>
        </AreaOutlet>
      </div>

      <div v-if="partVisible.right" aria-label="底部栏右区" class="flex min-w-0 items-center justify-end" :class="footer.right.class">
        <AreaOutlet
          name="layout-footer-right"
          :config="footer.right"
          :context="context"
          :slot-provided="Boolean(slots['footer-right'])"
          :route-view-available="areaSource.hasView('layout-footer-right')"
        >
          <template v-if="slots['footer-right']" #custom="slotProps">
            <slot name="footer-right" :context="slotProps.context" />
          </template>
          <template #default>
            <span>Powered by layouts</span>
          </template>
        </AreaOutlet>
      </div>
    </div>
  </footer>
</template>
