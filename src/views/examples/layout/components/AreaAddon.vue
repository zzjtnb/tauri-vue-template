<script setup lang="ts">
import type { Layout } from '@/components/layouts'

const props = withDefaults(defineProps<{
  context?: Layout['Area']['Context']
  label?: string
  icon?: string
}>(), {
  label: '区域附加内容',
  icon: 'i-lucide-sparkles',
})
</script>

<template>
  <span class="text-xs text-primary px-2.5 py-1 border border-primary/20 rounded-full bg-primary/10 inline-flex gap-1.5 items-center">
    <span class="size-3.5" :class="props.icon" aria-hidden="true" />
    {{ props.label }}
    <span v-if="props.context?.area" class="text-primary/70">· {{ props.context.area.part }}</span>
  </span>
</template>
