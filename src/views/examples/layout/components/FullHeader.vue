<script setup lang="ts">
import type { Layout } from '@/components/layouts'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="h-header px-4 border-b border-primary/20 bg-primary/10 flex gap-3 items-center justify-between">
    <span class="flex gap-3 min-w-0 items-center">
      <span class="i-lucide-app-window text-primary shrink-0 size-5" aria-hidden="true" />
      <span class="min-w-0">
        <span class="text-sm font-semibold block truncate">整区 Header 覆盖</span>
        <span class="text-xs text-muted-foreground block truncate">layout-header 优先于 left / center / right 组合。</span>
      </span>
    </span>
    <button type="button" class="text-xs px-3 py-1.5 border border-primary/20 rounded-full bg-background" @click="context.settings.show()">
      打开设置
    </button>
  </div>
</template>
