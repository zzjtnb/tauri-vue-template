<script setup lang="ts">
import type { Layout } from '@/components/layouts'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="flex gap-3 min-w-0 items-center">
    <span class="i-lucide-layout-dashboard text-primary p-2 rounded-xl bg-primary/10 size-9" aria-hidden="true" />
    <span class="min-w-0">
      <span class="text-sm font-semibold block truncate">布局实验台</span>
      <span class="text-xs text-muted-foreground block truncate">
        {{ context.layout.name }} · {{ context.area?.name }}
      </span>
    </span>
  </div>
</template>
