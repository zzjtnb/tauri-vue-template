<script setup lang="ts">
import type { Layout } from '@/components/layouts/types/public'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<Layout['Area']['Props'] & {
  variant?: 'header' | 'sidebar'
  collapsed?: boolean
  to?: string
}>()

const router = useRouter()
const variant = computed(() => props.variant ?? (props.context.area?.name.startsWith('layout-sidebar') ? 'sidebar' : 'header'))
const collapsed = computed(() => props.collapsed ?? (variant.value === 'sidebar' && props.context.sidebar.collapsed))
const rail = computed(() => variant.value === 'sidebar' && collapsed.value)
const buttonClass = computed(() => variant.value === 'sidebar'
  ? ['text-sm font-medium p-2 rounded-md flex gap-2 w-full transition items-center hover:text-sidebar-accent-foreground hover:bg-sidebar-accent', collapsed.value && 'justify-center px-2']
  : 'text-sm font-medium px-3 py-2 border rounded-lg gap-2 flex shadow-xs transition items-center hover:text-accent-foreground hover:bg-accent')
const textClass = computed(() => rail.value ? 'sr-only' : 'truncate')
const title = computed(() => rail.value ? '设置' : undefined)
const ariaLabel = computed(() => props.to ? '打开设置页面' : '打开布局设置')

async function openSettings(): Promise<void> {
  if (props.to) {
    await router.push(props.to)
    return
  }

  props.context.settings.show()
}
</script>

<template>
  <button
    type="button"
    :class="buttonClass"
    :title="title"
    :aria-label="ariaLabel"
    @click="openSettings"
  >
    <span class="i-lucide-settings shrink-0 size-4" aria-hidden="true" />
    <span :class="textClass">设置</span>
  </button>
</template>
