<script setup lang="ts">
import type { Layout } from '@/components/layouts/types/public'
import { computed } from 'vue'
import RouteMetaBar from '@/components/layouts/components/common/RouteMetaBar.vue'
import AppSettings from '@/components/layouts/components/common/settings/index.vue'
import ContentLayout from '@/components/layouts/components/content/index.vue'
import FooterLayout from '@/components/layouts/components/footer/index.vue'
import HeaderLayout from '@/components/layouts/components/header/index.vue'
import SidebarLayout from '@/components/layouts/components/sidebar/index.vue'
import { useRuntime } from '@/components/layouts/composables/useRuntime'
import { regionParts } from '@/components/layouts/types/regions'

/**
 * AppLayout 是布局库的公共组件入口。
 * 宿主通过库级默认上下文、provider 或 props.context 传入对象化上下文；普通路由表只声明 meta.layout。
 */
const props = defineProps<Layout['App']['Props']>()

/**
 * 显式 slots 是区域来源的最高优先级。
 * 所有区域 slot 统一只接收 Layout['Area']['Context']，避免把 sidebar/settings/actions 拆成散 props。
 */
const slots = defineSlots<{
  'default'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-left'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-brand'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-center'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'header-right'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-header'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-content'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'sidebar-footer'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'content-before'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'content-after'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-left'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-center'?: (props: { context: Layout['Area']['Context'] }) => unknown
  'footer-right'?: (props: { context: Layout['Area']['Context'] }) => unknown
}>()

type SlotName = 'default'
  | 'header'
  | 'header-left'
  | 'header-brand'
  | 'header-center'
  | 'header-right'
  | 'sidebar'
  | 'sidebar-header'
  | 'sidebar-content'
  | 'sidebar-footer'
  | 'content-before'
  | 'content-after'
  | 'footer'
  | 'footer-left'
  | 'footer-center'
  | 'footer-right'

// AppLayout 自己只负责把显式 slots 分发给对应区域组件；区域组件再决定 slot、命名视图、配置组件和默认内容的优先级。
// 子区 slot 名从 regionParts 派生，避免 header/sidebar/content/footer 子区清单在多处重复维护。
const headerSlots = slotsFor(['header', ...partSlots('header')])
const sidebarSlots = slotsFor(['sidebar', ...partSlots('sidebar')])
const contentSlots = slotsFor(['default', ...partSlots('content')])
const footerSlots = slotsFor(['footer', ...partSlots('footer')])

function partSlots(name: keyof typeof regionParts): SlotName[] {
  return regionParts[name].map(part => `${name}-${part}` as SlotName)
}

function slotsFor(names: readonly SlotName[]) {
  return computed(() => names.filter(name => Boolean(slots[name])))
}

// 运行时集中派生布局声明、区域上下文、菜单、页签和 shell 渲染状态。
// AppLayout 模板只消费 RenderContext，不能绕过 runtime 去读取散状态；这样对外更像三方库的稳定渲染入口。
const { runtime } = useRuntime(props, slots as Record<string, unknown>)
</script>

<template>
  <div aria-label="布局根容器" class="safe-area-content text-foreground bg-background flex relative" :class="runtime.shell.isStandardLayout && 'h-[100dvh] overflow-hidden'">
    <SidebarLayout v-if="runtime.shell.shouldRenderSidebar" :runtime="runtime">
      <template v-for="slotName in sidebarSlots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" :context="slotProps.context" />
      </template>
    </SidebarLayout>

    <div aria-label="布局主体容器" class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <!-- headerFixed=true 时，顶部栏和 RouteMetaBar 留在主体容器外层，页面滚动只影响内容区。 -->
      <header v-if="runtime.shell.shouldRenderHeader && runtime.elements.headerFixed" :aria-label="runtime.layout.header.label" class="shrink-0">
        <HeaderLayout :runtime="runtime">
          <template v-for="slotName in headerSlots" :key="slotName" #[slotName]="slotProps">
            <slot :name="slotName" :context="slotProps.context" />
          </template>
        </HeaderLayout>
        <RouteMetaBar :runtime="runtime" />
      </header>

      <div aria-label="布局滚动容器" class="flex flex-1 flex-col min-w-0 overflow-x-hidden overflow-y-auto">
        <!-- headerFixed=false 时，顶部栏进入滚动容器，适合内容优先的页面。 -->
        <header v-if="runtime.shell.shouldRenderHeader && !runtime.elements.headerFixed" :aria-label="runtime.layout.header.label" class="shrink-0">
          <HeaderLayout :runtime="runtime">
            <template v-for="slotName in headerSlots" :key="slotName" #[slotName]="slotProps">
              <slot :name="slotName" :context="slotProps.context" />
            </template>
          </HeaderLayout>
          <RouteMetaBar :runtime="runtime" />
        </header>

        <ContentLayout :runtime="runtime">
          <template v-for="slotName in contentSlots" :key="slotName" #[slotName]="slotProps">
            <slot :name="slotName" :context="slotProps.context" />
          </template>
        </ContentLayout>

        <FooterLayout v-if="runtime.shell.shouldRenderFooter && !runtime.elements.footerFixed" :runtime="runtime">
          <template v-for="slotName in footerSlots" :key="slotName" #[slotName]="slotProps">
            <slot :name="slotName" :context="slotProps.context" />
          </template>
        </FooterLayout>
      </div>

      <FooterLayout v-if="runtime.shell.shouldRenderFooter && runtime.elements.footerFixed" :runtime="runtime">
        <template v-for="slotName in footerSlots" :key="slotName" #[slotName]="slotProps">
          <slot :name="slotName" :context="slotProps.context" />
        </template>
      </FooterLayout>
    </div>

    <AppSettings :controls="runtime.context.settings" :state="runtime.settings" />
  </div>
</template>
