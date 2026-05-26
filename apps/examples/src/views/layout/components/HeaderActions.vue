<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="flex gap-2 items-center justify-end">
    <span class="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted hidden lg:inline-flex">
      {{ context.viewport.mobile ? '移动端' : '桌面端' }} · {{ context.sidebar.mode }}
    </span>
    <button type="button" class="text-sm px-3 py-2 border border-border rounded-xl bg-background transition hover:bg-accent" aria-label="切换侧边栏" @click="context.sidebar.toggle()">
      <span class="i-lucide-panel-left size-4" aria-hidden="true" />
      <span class="sr-only">切换侧边栏</span>
    </button>
  </div>
</template>
