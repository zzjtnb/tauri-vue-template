<script setup lang="ts">
import type { Layout } from '@/components/layouts'
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { AppLayout, LayoutRuntime } from '@/components/layouts'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const nestedState = reactive<Layout['State']>(structuredClone(LayoutRuntime.defaultState))
nestedState.preferences.layoutMode = 'hybrid'
nestedState.preferences.pageElements.breadcrumb = false
nestedState.preferences.pageElements.tabs = false
nestedState.preferences.pageElements.footerFixed = false

const nestedRoutes = [
  {
    path: '/examples/layout',
    component: () => import('@/views/examples/layout/index.vue'),
    meta: {
      title: '布局演示',
      icon: 'i-lucide-layout-dashboard',
      alwaysShow: true,
    },
    children: [
      {
        path: '/examples/layout/regions/areas',
        component: () => import('@/views/examples/layout/AreaOverrides.vue'),
        meta: { title: '区域对象', icon: 'i-lucide-panels-top-left' },
      },
      {
        path: '/examples/layout/regions/named-views',
        component: () => import('@/views/examples/layout/NamedViews.vue'),
        meta: { title: '命名视图', icon: 'i-lucide-route' },
      },
      {
        path: '/examples/layout/content/outlet',
        component: () => import('@/views/examples/layout/OutletControl.vue'),
        meta: { title: '内容接管', icon: 'i-lucide-square-dashed-mouse-pointer' },
      },
    ],
  },
] satisfies Layout['Route']['RecordRaw'][]

const nestedContext = {
  routes: nestedRoutes,
  settings: nestedState,
} satisfies Layout['Context']

const quickLinks = [
  { to: '/examples/layout/regions/areas', label: '区域对象' },
  { to: '/examples/layout/regions/named-views', label: '命名视图' },
  { to: '/examples/layout/content/outlet', label: '内容接管' },
]
</script>

<template>
  <ShowcaseFrame
    eyebrow="Explicit slots"
    title="显式 Slots 宿主"
    description="这个页面在内容区内再嵌入一个 AppLayout，并用显式 slots 覆盖 header、sidebar、content 和 footer。slot 是区域来源的最高优先级，会压过命名视图和 route.meta.layout 组件。"
  >
    <section class="border border-border rounded-3xl bg-background shadow-sm overflow-hidden" aria-label="嵌入式 AppLayout 插槽演示">
      <AppLayout :context="nestedContext">
        <template #header-left="{ context }">
          <div class="flex gap-3 min-w-0 items-center">
            <span class="i-lucide-component text-primary shrink-0 size-5" aria-hidden="true" />
            <span class="min-w-0">
              <span class="text-sm font-semibold block truncate">Slot Host</span>
              <span class="text-xs text-muted-foreground block truncate">{{ context.layout.name }} · {{ context.sidebar.mode }}</span>
            </span>
          </div>
        </template>

        <template #header-center>
          <nav class="gap-2 hidden justify-center md:flex" aria-label="嵌入式顶部导航">
            <RouterLink v-for="item in quickLinks" :key="item.to" :to="item.to" class="text-sm px-3 py-1.5 rounded-full hover:bg-muted">
              {{ item.label }}
            </RouterLink>
          </nav>
        </template>

        <template #header-right="{ context }">
          <button type="button" class="text-sm px-3 py-2 border border-border rounded-xl bg-background hover:bg-accent" @click="context.settings.show()">
            打开内层设置
          </button>
        </template>

        <template #sidebar-header="{ context }">
          <div class="p-3 flex gap-2 items-center" :class="context.sidebar.collapsed ? 'justify-center' : ''">
            <span class="i-lucide-box text-sidebar-primary size-5" aria-hidden="true" />
            <span :class="context.sidebar.collapsed ? 'sr-only' : 'text-sm font-semibold truncate'">插槽侧栏</span>
          </div>
        </template>

        <template #sidebar-content="{ context }">
          <nav class="p-2 flex flex-col gap-1" aria-label="嵌入式侧栏导航">
            <RouterLink v-for="item in quickLinks" :key="item.to" :to="item.to" class="text-sm text-sidebar-foreground/75 px-3 py-2 rounded-xl flex gap-2 items-center hover:bg-sidebar-accent">
              <span class="i-lucide-dot size-4" aria-hidden="true" />
              <span :class="context.sidebar.collapsed ? 'sr-only' : ''">{{ item.label }}</span>
            </RouterLink>
          </nav>
        </template>

        <template #sidebar-footer="{ context }">
          <div class="text-xs text-sidebar-foreground/65 p-3" :class="context.sidebar.collapsed ? 'text-center' : ''">
            <span :class="context.sidebar.collapsed ? 'sr-only' : ''">slot 优先级最高</span>
            <span v-if="context.sidebar.collapsed" class="i-lucide-badge-check size-4" aria-hidden="true" />
          </div>
        </template>

        <template #content-before="{ context }">
          <div class="text-sm px-4 py-3 border-b border-border bg-card/70 flex gap-2 items-center justify-between">
            <span class="font-medium">content-before slot</span>
            <span class="text-xs text-muted-foreground">{{ context.area?.name }}</span>
          </div>
        </template>

        <template #default="{ context }">
          <section class="p-5 bg-muted/30 flex flex-col gap-4 min-h-[32rem]">
            <article class="p-5 border border-border rounded-3xl bg-background">
              <h2 class="text-xl font-semibold m-0">
                默认内容 slot
              </h2>
              <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3">
                当前内容来自 AppLayout 的 default slot。这里仍能读取区域 context：layout={{ context.layout.name }}，sidebar={{ context.sidebar.mode }}，settings.open={{ context.settings.open }}。
              </p>
            </article>
          </section>
        </template>

        <template #content-after="{ context }">
          <div class="text-sm px-4 py-3 border-t border-border bg-card/70 flex gap-2 items-center justify-between">
            <span class="font-medium">content-after slot</span>
            <span class="text-xs text-muted-foreground">{{ context.area?.name }}</span>
          </div>
        </template>

        <template #footer="{ context }">
          <div class="text-sm text-muted-foreground px-4 py-3 flex items-center justify-between">
            <span>完整 footer slot · {{ context.area?.name }}</span>
            <span class="text-xs px-3 py-1 border border-border rounded-full bg-background">外层页面不参与内层插槽</span>
          </div>
        </template>
      </AppLayout>
    </section>
  </ShowcaseFrame>
</template>
