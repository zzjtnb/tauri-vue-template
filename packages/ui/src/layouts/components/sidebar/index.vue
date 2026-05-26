<script setup lang="ts">
import type { RenderContext, ResolvedArea } from '../../types/internal'
import type { Layout } from '../../types/public'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { createAreaSource } from '../../utils/area'
import AreaOutlet from '../common/AreaOutlet.vue'
import SidebarContent from './Content.vue'
import SidebarHeader from './Header.vue'

const props = defineProps<{
  runtime: RenderContext
}>()

const slots = defineSlots<{
  'sidebar'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-header'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-content'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-footer'?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

const route = useRoute()
const sidebar = computed(() => props.runtime.layout.sidebar)
const context = computed(() => props.runtime.context)
const areaSource = createAreaSource(route, slots as Record<string, unknown>)
const width = shallowRef(240)
const resizing = shallowRef(false)
const style = computed(() => ({ '--sidebar-width': `${width.value}px` }))
const partVisible = computed(() => ({
  header: showArea(sidebar.value.header, 'layout-sidebar-header', 'sidebar-header'),
  content: showArea(sidebar.value.content, 'layout-sidebar-content', 'sidebar-content'),
  footer: showArea(sidebar.value.footer, 'layout-sidebar-footer', 'sidebar-footer', false),
}))

const minWidth = 200
const maxWidth = 360
const step = 16
let startX = 0
let startWidth = width.value
let pointerId: number | null = null
let handleEl: HTMLElement | null = null
let bodyCursor = ''
let bodySelect = ''

// 侧边栏整区 slot / 命名视图优先；只有没有整区覆盖时才组合 header/content/footer 子区。
function showArea(config: ResolvedArea, viewName: string, slotName: string, autoDefault = true): boolean {
  return areaSource.shouldRender(config, viewName, slotName, { autoDefault })
}

function clamp(value: number): number {
  return Math.min(maxWidth, Math.max(minWidth, value))
}

function setWidth(value: number): void {
  width.value = clamp(value)
}

function onPointerMove(event: PointerEvent): void {
  if (pointerId !== null && event.pointerId !== pointerId)
    return

  event.preventDefault()
  setWidth(startWidth + event.clientX - startX)
}

function onHidden(): void {
  if (document.visibilityState === 'hidden')
    stopResize()
}

function stopResize(event?: Event): void {
  if (!resizing.value)
    return

  if (event && 'pointerId' in event && pointerId !== null && event.pointerId !== pointerId)
    return

  resizing.value = false
  document.body.style.cursor = bodyCursor
  document.body.style.userSelect = bodySelect

  try {
    if (handleEl && pointerId !== null && handleEl.hasPointerCapture(pointerId))
      handleEl.releasePointerCapture(pointerId)
  }
  catch {
    // pointerup / pointercancel 后浏览器可能已经自动释放 capture，收尾流程不能因此中断。
  }

  pointerId = null
  handleEl = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
  window.removeEventListener('blur', stopResize)
  document.removeEventListener('visibilitychange', onHidden)
}

function startResize(event: PointerEvent): void {
  if (context.value.viewport.mobile || props.runtime.shell.renderSidebarAsRail)
    return

  event.preventDefault()
  if (resizing.value)
    stopResize()

  const handleElement = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  pointerId = event.pointerId
  handleEl = handleElement
  startX = event.clientX
  startWidth = width.value
  bodyCursor = document.body.style.cursor
  bodySelect = document.body.style.userSelect
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  resizing.value = true

  if (handleElement)
    handleElement.setPointerCapture(event.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
  window.addEventListener('blur', stopResize)
  document.addEventListener('visibilitychange', onHidden)
}

onBeforeUnmount(() => stopResize())
</script>

<template>
  <aside
    id="layout-sidebar-panel"
    :aria-label="sidebar.label"
    class="text-sidebar-foreground bg-sidebar flex shrink-0 flex-col overflow-visible"
    :style="style"
    :class="context.viewport.mobile ? 'fixed inset-0 z-50 h-[100dvh] w-full' : ['relative h-full border-r border-sidebar-border', resizing ? 'transition-none' : 'transition-[width] duration-200', runtime.shell.renderSidebarAsRail ? 'w-16' : 'w-sidebar']"
  >
    <div class="flex flex-col h-full min-h-0 overflow-hidden" :class="[context.viewport.mobile && 'safe-area-content', sidebar.class]">
      <AreaOutlet
        name="layout-sidebar"
        :config="sidebar"
        :context="context"
        :slot-provided="Boolean(slots.sidebar)"
        :route-view-available="areaSource.hasView('layout-sidebar')"
      >
        <template v-if="slots.sidebar" #custom="slotProps">
          <slot name="sidebar" :context="slotProps.context" />
        </template>

        <template #default>
          <div aria-label="默认侧边栏" class="flex flex-col h-full min-h-0">
            <div v-if="partVisible.header" aria-label="侧边栏头部容器" class="border-b border-sidebar-border shrink-0" :class="sidebar.header.class">
              <AreaOutlet
                name="layout-sidebar-header"
                :config="sidebar.header"
                :context="context"
                :slot-provided="Boolean(slots['sidebar-header'])"
                :route-view-available="areaSource.hasView('layout-sidebar-header')"
              >
                <template v-if="slots['sidebar-header']" #custom="slotProps">
                  <slot name="sidebar-header" :context="slotProps.context" />
                </template>
                <template #default>
                  <SidebarHeader :runtime="runtime" />
                </template>
              </AreaOutlet>
            </div>

            <div v-if="partVisible.content" aria-label="侧边栏内容容器" class="flex-1 min-h-0 overflow-x-hidden overflow-y-auto" :class="sidebar.content.class">
              <AreaOutlet
                name="layout-sidebar-content"
                :config="sidebar.content"
                :context="context"
                :slot-provided="Boolean(slots['sidebar-content'])"
                :route-view-available="areaSource.hasView('layout-sidebar-content')"
              >
                <template v-if="slots['sidebar-content']" #custom="slotProps">
                  <slot name="sidebar-content" :context="slotProps.context" />
                </template>
                <template #default>
                  <SidebarContent :runtime="runtime" />
                </template>
              </AreaOutlet>
            </div>

            <div v-if="partVisible.footer" aria-label="侧边栏底部容器" class="border-t border-sidebar-border shrink-0" :class="sidebar.footer.class">
              <AreaOutlet
                name="layout-sidebar-footer"
                :config="sidebar.footer"
                :context="context"
                :slot-provided="Boolean(slots['sidebar-footer'])"
                :route-view-available="areaSource.hasView('layout-sidebar-footer')"
              >
                <template v-if="slots['sidebar-footer']" #custom="slotProps">
                  <slot name="sidebar-footer" :context="slotProps.context" />
                </template>
                <template #default>
                  <span class="sr-only">侧边栏底部区域</span>
                </template>
              </AreaOutlet>
            </div>
          </div>
        </template>
      </AreaOutlet>
    </div>

    <div
      v-if="!context.viewport.mobile && !runtime.shell.renderSidebarAsRail"
      role="separator"
      tabindex="0"
      aria-label="调整侧边栏宽度"
      aria-controls="layout-sidebar-panel"
      aria-orientation="vertical"
      :aria-valuemin="minWidth"
      :aria-valuemax="maxWidth"
      :aria-valuenow="width"
      :aria-valuetext="`当前宽度 ${width} 像素，可用左右方向键、Home 或 End 调整`"
      aria-keyshortcuts="ArrowLeft ArrowRight Home End"
      class="group flex w-4 cursor-col-resize select-none items-center inset-y-0 justify-center absolute z-20 touch-none focus-visible:outline-none -right-2"
      @pointerdown="startResize"
      @keydown.left.prevent="setWidth(width - step)"
      @keydown.right.prevent="setWidth(width + step)"
      @keydown.home.prevent="setWidth(minWidth)"
      @keydown.end.prevent="setWidth(maxWidth)"
    >
      <div class="bg-sidebar-border h-full w-px transition-colors group-focus-visible:bg-sidebar-ring group-hover:bg-sidebar-ring/60" />
      <div class="border border-sidebar-border rounded-sm bg-sidebar opacity-0 h-8 w-3 shadow-sm transition-opacity absolute group-focus-visible:opacity-100 group-hover:opacity-100" />
    </div>

    <div
      v-if="resizing"
      class="cursor-col-resize select-none inset-0 fixed z-[9999] touch-none"
      aria-hidden="true"
      @contextmenu.prevent
      @pointermove="onPointerMove"
      @pointerup="stopResize"
      @pointercancel="stopResize"
    />
  </aside>
</template>
