<script setup lang="ts">
import type { Layout } from '@/components/layouts'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="p-3 border border-primary/20 rounded-2xl bg-primary/10">
    <p class="text-xs text-primary font-medium m-0">
      命名视图覆盖
    </p>
    <p class="text-sm font-semibold mb-0 mt-1">
      {{ context.area?.label }}
    </p>
    <p class="text-xs text-muted-foreground mb-0 mt-1">
      {{ context.area?.name }} · {{ context.area?.region }}/{{ context.area?.part }}
    </p>
  </div>
</template>
