<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const route = useRoute()
const currentLayout = computed(() => (route.meta as Layout['Route']['Meta']).layout ?? 'topnav')
const layoutName = computed(() => typeof currentLayout.value === 'string' ? currentLayout.value : currentLayout.value.name)

const modes = [
  { to: '/layout/standard/topnav', name: 'topnav', title: 'Topnav', description: '顶部导航承载主菜单，移动端仍可复用侧边栏作为抽屉菜单。' },
  { to: '/layout/standard/sidebar', name: 'sidebar', title: 'Sidebar', description: '侧边栏承载主菜单，顶部栏保留页面标题、折叠入口和操作区。' },
  { to: '/layout/standard/hybrid', name: 'hybrid', title: 'Hybrid', description: '顶部导航和侧边栏同时存在，适合复杂后台或工作台。' },
  { to: '/layout/standard/blank', name: 'blank', title: 'Blank', description: '不渲染标准 header/sidebar/footer，只保留基础内容出口。' },
] as const

const facts = computed(() => [
  { label: '当前 layout', value: layoutName.value, description: '来自当前路由 meta.layout。' },
  { label: 'breadcrumb', value: route.meta.breadcrumb === false ? '关闭' : '开启', description: '决定当前层级是否进入面包屑候选。' },
  { label: 'affix', value: route.meta.affix ? '固定页签' : '普通页签', description: 'affix 页签固定显示在页签栏前方。' },
  { label: 'footer', value: layoutName.value === 'blank' ? '不承接' : '配置组件', description: '标准布局示例通过 route.meta.layout.footer 直接配置底栏组件。' },
])
</script>

<template>
  <ShowcaseFrame
    eyebrow="Standard modes"
    :title="`${layoutName} 标准布局`"
    description="四种 LayoutName 是最基础的入口：topnav、sidebar、hybrid 属于标准布局，可被设置面板里的普通页面布局偏好覆盖；blank 是路由强语义布局，不受偏好覆盖。"
  >
    <section class="gap-3 grid md:grid-cols-4" aria-label="布局模式切换">
      <RouterLink
        v-for="mode in modes"
        :key="mode.name"
        :to="mode.to"
        class="p-4 border rounded-2xl bg-card transition hover:border-primary/50 hover:bg-primary/5"
        :class="layoutName === mode.name ? 'border-primary bg-primary/5' : 'border-border'"
      >
        <h2 class="text-base font-semibold m-0">
          {{ mode.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ mode.description }}
        </p>
      </RouterLink>
    </section>

    <section class="gap-3 grid md:grid-cols-4" aria-label="当前路由布局事实">
      <article v-for="item in facts" :key="item.label" class="p-4 border border-border rounded-2xl bg-background">
        <p class="text-xs text-muted-foreground m-0">
          {{ item.label }}
        </p>
        <h2 class="text-xl font-semibold mb-0 mt-1">
          {{ item.value }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ item.description }}
        </p>
      </article>
    </section>

    <section class="p-5 border border-border rounded-3xl bg-card" aria-label="标准布局边界说明">
      <h2 class="text-lg font-semibold m-0">
        验证点
      </h2>
      <ul class="text-sm text-muted-foreground leading-7 mb-0 mt-3 pl-5">
        <li>进入 topnav/sidebar/hybrid 可看到同一页面在不同标准布局容器中的差异。</li>
        <li>打开设置面板切换普通页面布局模式，会影响未 fixed 的 topnav/sidebar/hybrid 标准页面；blank 默认固定。</li>
        <li>blank 路由不承接 header、sidebar、footer，也不展示标准底栏配置组件。</li>
      </ul>
    </section>
  </ShowcaseFrame>
</template>
