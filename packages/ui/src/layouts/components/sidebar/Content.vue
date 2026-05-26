<script setup lang="ts">
import type { RenderContext } from '../../types/internal'
import NavigationMenu from '../common/NavigationMenu.vue'

const props = defineProps<{
  runtime: RenderContext
}>()

function onSelect(): void {
  if (props.runtime.context.viewport.mobile) {
    props.runtime.context.sidebar.close()
  }
}
</script>

<template>
  <NavigationMenu
    :items="runtime.navigation.items"
    :active-path="runtime.navigation.activePath"
    label="侧边栏导航"
    variant="vertical"
    :collapsed="runtime.shell.renderSidebarAsRail"
    :menu-mode="runtime.navigation.menuMode.sidebar"
    surface="sidebar"
    @select="onSelect"
  />
</template>
