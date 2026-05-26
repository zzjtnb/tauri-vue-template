<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'

defineProps<{
  context: Layout['Area']['Context']
}>()
</script>

<template>
  <div class="p-3 flex gap-3 items-center" :class="context.sidebar.collapsed ? 'justify-center' : ''">
    <span class="text-sidebar-primary rounded-2xl bg-sidebar-accent grid size-10 place-items-center">
      <span class="i-lucide-panels-top-left size-5" aria-hidden="true" />
    </span>
    <span v-if="!context.sidebar.collapsed" class="min-w-0">
      <span class="text-sm font-semibold block truncate">区域预设侧栏</span>
      <span class="text-xs text-sidebar-foreground/60 block truncate">header/content/footer 子区</span>
    </span>
  </div>
</template>
