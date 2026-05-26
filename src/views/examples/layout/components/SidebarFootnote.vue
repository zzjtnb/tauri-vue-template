<script setup lang="ts">
import type { Layout } from '@/components/layouts'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="text-xs text-sidebar-foreground/65 p-3 flex gap-2 items-center" :class="context.sidebar.collapsed ? 'justify-center' : 'justify-between'">
    <span class="flex gap-2 min-w-0 items-center">
      <span class="i-lucide-shield-check text-sidebar-primary shrink-0 size-4" aria-hidden="true" />
      <span :class="context.sidebar.collapsed ? 'sr-only' : 'truncate'">滚动与安全区仍由布局层控制</span>
    </span>
    <span v-if="!context.sidebar.collapsed" class="rounded-full bg-success size-2" aria-label="已启用" />
  </div>
</template>
