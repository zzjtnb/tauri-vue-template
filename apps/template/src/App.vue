<script setup lang="ts">
import { Toaster } from '@tauri-vue-template/ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <Toaster rich-colors position="top-right" />
</template>
