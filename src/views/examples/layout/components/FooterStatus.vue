<script setup lang="ts">
import type { Layout } from '@/components/layouts'

const props = withDefaults(defineProps<{
  context?: Layout['Area']['Context']
  label?: string
}>(), {
  label: '底部栏命名视图',
})
</script>

<template>
  <div class="text-sm text-muted-foreground px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <span class="flex gap-2 min-w-0 items-center">
      <span class="i-lucide-panel-bottom text-primary shrink-0 size-4" aria-hidden="true" />
      <span class="font-medium truncate">{{ props.label }}</span>
      <span class="truncate">footer 可由整区组件、命名视图或 left / center / right 子区提供。</span>
    </span>
    <span class="text-xs px-3 py-1 border border-border rounded-full bg-background">
      {{ props.context?.layout.name ?? 'route view' }}
    </span>
  </div>
</template>
