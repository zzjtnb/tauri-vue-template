<script setup lang="ts">
import type { RenderContext } from '@/components/layouts/types/internal'
import type { Layout } from '@/components/layouts/types/public'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AreaOutlet from '@/components/layouts/components/common/AreaOutlet.vue'
import { resolveNamedView } from '@/components/layouts/utils/area'

const props = defineProps<{
  runtime: RenderContext
}>()

const slots = defineSlots<{
  brand?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

const route = useRoute()
const context = computed(() => props.runtime.context)
const brand = computed(() => props.runtime.layout.header.brand)
const usesSidebar = computed(() => context.value.layout.name === 'sidebar'
  || context.value.layout.name === 'hybrid'
  || (context.value.viewport.mobile && context.value.layout.name === 'topnav'))
const usesTopnav = computed(() => context.value.layout.name === 'topnav' || context.value.layout.name === 'hybrid')
const hasBrandView = computed(() => Boolean(resolveNamedView(route, 'layout-header-brand')))
const toggleLabel = computed(() => context.value.viewport.mobile || context.value.sidebar.collapsed ? '打开侧边栏' : '折叠侧边栏')
const togglePressed = computed(() => context.value.viewport.mobile ? !context.value.sidebar.hidden : !context.value.sidebar.collapsed)
const toggleIcon = computed(() => {
  if (context.value.viewport.mobile) {
    return 'i-lucide-text-align-justify'
  }

  return context.value.sidebar.collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'
})
</script>

<template>
  <div aria-label="顶部栏左区默认内容" class="flex gap-3 min-w-0 items-center">
    <button
      v-if="usesSidebar"
      type="button"
      class="border border-transparent rounded-xl bg-transparent shrink-0 grid transition place-items-center hover:bg-transparent"
      :class="context.viewport.mobile ? 'size-9 text-foreground' : 'size-9 text-muted-foreground hover:text-foreground'"
      :aria-label="toggleLabel"
      :aria-pressed="togglePressed"
      @click="context.sidebar.toggle"
    >
      <span class="size-4" :class="toggleIcon" aria-hidden="true" />
    </button>

    <div :class="brand.class">
      <AreaOutlet
        name="layout-header-brand"
        :config="brand"
        :context="context"
        :slot-provided="Boolean(slots.brand)"
        :route-view-available="hasBrandView"
      >
        <template v-if="slots.brand" #custom="slotProps">
          <slot name="brand" :context="slotProps.context" />
        </template>
        <template #default>
          <div aria-label="顶部栏品牌区域" class="flex gap-2 min-w-0 items-center">
            <span v-if="usesTopnav" class="i-lucide-sparkles shrink-0 size-5" aria-hidden="true" />
            <p class="text-sm font-semibold m-0 truncate">
              {{ runtime.page.title }}
            </p>
          </div>
        </template>
      </AreaOutlet>
    </div>
  </div>
</template>
