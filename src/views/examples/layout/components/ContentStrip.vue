<script setup lang="ts">
import type { Layout } from '@/components/layouts'

const props = withDefaults(defineProps<{
  context: Layout['Area']['Context']
  title?: string
  description?: string
}>(), {
  title: '内容附加区',
  description: 'content.before / content.after 可以承载页面工具条、筛选条或局部状态栏。',
})
</script>

<template>
  <div class="px-4 py-3 border-b border-border bg-card/70 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <span class="flex gap-2 min-w-0 items-center">
      <span class="i-lucide-panel-top-open text-primary shrink-0 size-4" aria-hidden="true" />
      <span class="text-sm font-semibold truncate">{{ props.title }}</span>
      <span class="text-xs text-muted-foreground hidden truncate md:inline">{{ props.description }}</span>
    </span>
    <span class="text-xs text-muted-foreground px-2.5 py-1 border border-border rounded-full bg-background">
      {{ context.area?.name }}
    </span>
  </div>
</template>
