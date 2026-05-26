<script setup lang="ts">
import type { Layout } from '@/components/layouts'
import { RouterLink } from 'vue-router'

defineProps<{
  context: Layout['Area']['Context']
}>()

const links = [
  { to: '/examples/layout', label: '总览', icon: 'i-lucide-layout-dashboard' },
  { to: '/examples/layout/standard', label: '标准布局', icon: 'i-lucide-panel-top' },
  { to: '/examples/layout/regions', label: '区域扩展', icon: 'i-lucide-panels-top-left' },
  { to: '/examples/layout/content', label: '内容出口', icon: 'i-lucide-square-dashed-mouse-pointer' },
  { to: '/examples/layout/state', label: '状态导航', icon: 'i-lucide-history' },
] as const
</script>

<template>
  <nav class="p-2 flex flex-col gap-1" aria-label="布局演示自定义侧栏导航">
    <RouterLink
      v-for="item in links"
      :key="item.to"
      :to="item.to"
      class="text-sm text-sidebar-foreground/75 px-3 py-2.5 rounded-xl flex gap-2 transition items-center hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      active-class="text-sidebar-accent-foreground bg-sidebar-accent"
      :aria-label="item.label"
      @click="context.viewport.mobile && context.sidebar.close()"
    >
      <span class="shrink-0 size-4" :class="item.icon" aria-hidden="true" />
      <span :class="context.sidebar.collapsed ? 'sr-only' : 'truncate'">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
