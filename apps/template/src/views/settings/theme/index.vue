<script setup lang="ts">
import { LayoutRuntime, LayoutSettings } from '@tauri-vue-template/ui'
import { computed } from 'vue'

const layoutContext = LayoutRuntime.context.use()
const layoutSettings = computed(() => layoutContext.settings)
</script>

<template>
  <LayoutSettings :state="layoutSettings" flush />
</template>
