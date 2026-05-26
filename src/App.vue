<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/shadcn-vue/ui/sonner'
</script>

<template>
  <RouterView />
  <Toaster rich-colors position="top-right" />
</template>
