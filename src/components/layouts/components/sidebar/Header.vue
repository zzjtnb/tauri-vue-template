<script setup lang="ts">
import type { RenderContext } from '@/components/layouts/types/internal'

defineProps<{
  runtime: RenderContext
}>()
</script>

<template>
  <div class="h-header px-3 flex min-w-0 items-center">
    <div aria-label="侧边栏品牌区域" class="flex gap-2 min-w-0 w-full items-center" :class="runtime.shell.renderSidebarAsRail ? 'justify-center' : 'justify-between'">
      <span class="flex gap-2 min-w-0 items-center">
        <span class="i-lucide-sparkles shrink-0 size-5" aria-hidden="true" />
        <span :class="runtime.shell.renderSidebarAsRail ? 'sr-only' : 'text-sm font-semibold truncate'">{{ runtime.page.title }}</span>
      </span>
      <button type="button" class="text-sidebar-foreground/70 p-2 rounded-lg transition hover:text-sidebar-foreground hover:bg-sidebar-accent md:hidden" aria-label="关闭侧边栏" @click="runtime.context.sidebar.close">
        <span class="i-lucide-x size-5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
