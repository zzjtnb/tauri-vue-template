<script setup lang="ts">
import type { RenderContext } from '@/components/layouts/types/internal'
import { computed } from 'vue'
import NavigationMenu from '@/components/layouts/components/common/NavigationMenu.vue'

const props = defineProps<{
  runtime: RenderContext
}>()

const usesTopnav = computed(() => props.runtime.context.layout.name === 'topnav' || props.runtime.context.layout.name === 'hybrid')
</script>

<template>
  <NavigationMenu
    v-if="usesTopnav"
    :items="runtime.navigation.items"
    :active-path="runtime.navigation.activePath"
    label="顶部导航"
    variant="horizontal"
    :menu-mode="runtime.navigation.menuMode.topnav"
  />
</template>
