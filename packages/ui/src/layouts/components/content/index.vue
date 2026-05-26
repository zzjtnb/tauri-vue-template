<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { RenderContext, ResolvedArea } from '../../types/internal'
import type { Layout } from '../../types/public'
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { createAreaSource } from '../../utils/area'
import AreaOutlet from '../common/AreaOutlet.vue'

const props = defineProps<{
  runtime: RenderContext
}>()

const slots = defineSlots<{
  'default'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'content-before'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'content-after'?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

const content = computed(() => props.runtime.layout.content)
const context = computed(() => props.runtime.context)
const areaSource = createAreaSource(props.runtime.context.route, slots as Record<string, unknown>)
const visible = computed(() => ({
  before: showArea(content.value.before, 'layout-content-before', 'content-before', false),
  main: showArea(content.value, 'layout-content', 'default'),
  after: showArea(content.value.after, 'layout-content-after', 'content-after', false),
}))

function showArea(config: ResolvedArea, viewName: string, slotName: string, autoDefault = true): boolean {
  return areaSource.shouldRender(config, viewName, slotName, {
    autoDefault,
    customPlaceholder: true,
  })
}

// iframe 属于内容渲染能力，不参与 layout 声明合并；这里只从 route meta 读取最终渲染参数。
const iframeContent = computed(() => {
  const meta = props.runtime.context.route.meta as Layout['Route']['Meta'] | undefined
  const title = `${meta?.title ?? '页面'}`

  return {
    title,
    label: `${title}主内容`,
    src: `${meta?.iframeSrc ?? ''}`.trim(),
    sandbox: meta?.iframeSandbox?.trim() || undefined,
    referrerPolicy: meta?.iframeReferrerPolicy,
    allow: meta?.iframeAllow?.trim() || undefined,
  }
})

function cacheKey(viewRoute: RouteLocationNormalizedLoaded): string {
  const cacheKey = `${(viewRoute.meta as Layout['Route']['Meta'] | undefined)?.cacheKey ?? ''}`.trim()
  return cacheKey || viewRoute.fullPath
}

// 高级宿主传入 tabs 时以 adapter 的缓存列表为准；否则回退到 route.meta.keepAlive。
function keepAlive(viewRoute: RouteLocationNormalizedLoaded): boolean {
  if (props.runtime.tabs) {
    return props.runtime.tabs.cachedViewSet?.value.has(viewRoute.fullPath) ?? props.runtime.tabs.cachedViews.value.includes(viewRoute.fullPath)
  }

  return Boolean((viewRoute.meta as Layout['Route']['Meta'] | undefined)?.keepAlive)
}
</script>

<template>
  <div v-if="visible.before" aria-label="内容前置区域" class="shrink-0" :class="content.before.class">
    <AreaOutlet
      name="layout-content-before"
      :config="content.before"
      :context="context"
      :slot-provided="Boolean(slots['content-before'])"
      :route-view-available="areaSource.hasView('layout-content-before')"
      :auto-default="false"
    >
      <template v-if="slots['content-before']" #custom="slotProps">
        <slot name="content-before" :context="slotProps.context" />
      </template>
    </AreaOutlet>
  </div>

  <main v-if="visible.main" :aria-label="content.label" class="flex flex-1 flex-col min-h-0 min-w-0" :class="content.class">
    <AreaOutlet
      name="layout-content"
      :config="content"
      :context="context"
      :slot-provided="Boolean(slots.default)"
      :route-view-available="areaSource.hasView('layout-content')"
    >
      <template v-if="slots.default" #custom="slotProps">
        <slot name="default" :context="slotProps.context" />
      </template>
      <template #default>
        <section :aria-label="iframeContent.label" class="p-4 flex flex-1 flex-col min-w-0 overflow-x-hidden md:p-6">
          <iframe
            v-if="iframeContent.src"
            :src="iframeContent.src"
            :title="iframeContent.title"
            :sandbox="iframeContent.sandbox"
            :referrerpolicy="iframeContent.referrerPolicy"
            :allow="iframeContent.allow"
            class="border border-border rounded-lg min-h-[70vh] w-full"
          />
          <RouterView v-else v-slot="{ Component, route: viewRoute }">
            <KeepAlive v-if="Component && keepAlive(viewRoute)">
              <component :is="Component" :key="cacheKey(viewRoute)" />
            </KeepAlive>
            <component :is="Component" v-else-if="Component" :key="cacheKey(viewRoute)" />
          </RouterView>
        </section>
      </template>
    </AreaOutlet>
  </main>

  <div v-if="visible.after" aria-label="内容后置区域" class="shrink-0" :class="content.after.class">
    <AreaOutlet
      name="layout-content-after"
      :config="content.after"
      :context="context"
      :slot-provided="Boolean(slots['content-after'])"
      :route-view-available="areaSource.hasView('layout-content-after')"
      :auto-default="false"
    >
      <template v-if="slots['content-after']" #custom="slotProps">
        <slot name="content-after" :context="slotProps.context" />
      </template>
    </AreaOutlet>
  </div>
</template>
