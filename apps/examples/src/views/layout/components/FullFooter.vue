<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="text-sm px-4 py-3 border-t border-primary/20 bg-primary/10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <span class="flex gap-2 min-w-0 items-center">
      <span class="i-lucide-panel-bottom text-primary shrink-0 size-4" aria-hidden="true" />
      <span class="font-semibold truncate">整区 Footer 组件</span>
      <span class="text-muted-foreground truncate">通过 route.meta.layout.footer 直接声明。</span>
    </span>
    <span class="text-xs px-3 py-1 border border-border rounded-full bg-background">{{ context.layout.name }}</span>
  </div>
</template>
