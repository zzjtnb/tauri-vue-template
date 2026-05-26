<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const route = useRoute()

const links = [
  { to: '/examples/layout/content/iframe', title: '说明页', description: '普通 RouterView 内容，用来对照 iframe 路由。' },
  { to: '/examples/layout/content/iframe/local', title: '本地 iframe', description: 'iframeSrc 指向同应用 hidden blank 路由，sandbox 保留 same-origin 供 Vite 模块脚本加载。' },
  { to: '/examples/layout/content/iframe/external', title: '外部 iframe', description: 'iframeSrc 指向外部地图，并透传 allow/referrerPolicy。' },
]
</script>

<template>
  <ShowcaseFrame
    eyebrow="Iframe outlet"
    title="iframe 内容出口"
    description="只要路由 meta 声明 iframeSrc，标准内容出口就会渲染 iframe，而不是当前 route component；sandbox、referrerPolicy、allow 会从 meta 透传。"
  >
    <section class="gap-3 grid md:grid-cols-3" aria-label="iframe 路由入口">
      <RouterLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="p-4 border rounded-2xl bg-card transition hover:border-primary/50 hover:bg-primary/5"
        :class="route.path === item.to ? 'border-primary bg-primary/5' : 'border-border'"
      >
        <h2 class="text-base font-semibold m-0">
          {{ item.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ item.description }}
        </p>
      </RouterLink>
    </section>

    <section class="p-5 border border-border rounded-3xl bg-card" aria-label="iframe meta 说明">
      <h2 class="text-lg font-semibold m-0">
        当前页仍是普通内容
      </h2>
      <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3">
        点击“本地 iframe”或“外部 iframe”后，这个组件不会出现在内容区，因为 AppLayout 会优先读取 route.meta.iframeSrc 并渲染 iframe。这样 iframe 能复用同一套 header、sidebar、breadcrumb、tabs 和 footer。
      </p>
    </section>
  </ShowcaseFrame>
</template>
