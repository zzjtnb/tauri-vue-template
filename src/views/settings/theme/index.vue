<script setup lang="ts">
import { computed } from 'vue'
import { LayoutRuntime, LayoutSettings } from '@/components/layouts'

const layoutContext = LayoutRuntime.context.use()
const layoutSettings = computed(() => layoutContext.settings)
</script>

<template>
  <LayoutSettings :state="layoutSettings" flush />
</template>
