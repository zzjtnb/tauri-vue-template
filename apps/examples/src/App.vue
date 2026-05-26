<script setup lang="ts">
import { Toaster } from '@tauri-vue-template/ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <!--
    examples 根组件只保留路由出口和全局消息容器：
    - 具体演示页面全部由 router/modules 挂载，根组件不承载业务状态。
    - Toaster 放在根层，保证 shadcn-vue feedback 示例和工具页 toast 都能统一显示。
    - 不安装模板应用的 Pinia / Tauri 状态，保持示例应用与模板核心运行态解耦。
  -->
  <RouterView />
  <Toaster rich-colors position="top-right" />
</template>
