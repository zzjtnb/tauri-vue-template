<script setup lang="ts">
import { useAppStore } from '@/stores'
import BuildPath from './BuildPath.vue'
import CapabilityGrid from './CapabilityGrid.vue'
import Overview from './Overview.vue'

const appStore = useAppStore()

const capabilities = [
  {
    title: '顶部导航骨架',
    description: '根路由、顶部导航、设置入口和错误页组成标准应用入口。',
    icon: 'i-lucide-panels-top-left',
    accent: 'bg-blue-500',
  },
  {
    title: '模板 API',
    description: '保留 /api/template/status 与 /api/template/echo 作为接入示例。',
    icon: 'i-lucide-plug-zap',
    accent: 'bg-emerald-500',
  },
  {
    title: '桌面与文件',
    description: '设置页展示 Tauri 系统信息、窗口状态、路径打开、文件读写和上传能力。',
    icon: 'i-lucide-monitor-cog',
    accent: 'bg-amber-500',
  },
  {
    title: '示例隔离',
    description: '组件、主题、布局和 Logo 等演示统一收敛在 /examples。',
    icon: 'i-lucide-blocks',
    accent: 'bg-rose-500',
  },
] as const
</script>

<template>
  <main class="mx-auto p-4 flex flex-col gap-8 max-w-7xl w-full md:p-8">
    <Overview :title="appStore.system.title" :version="appStore.system.version" />
    <CapabilityGrid :capabilities="capabilities" />
    <BuildPath />
  </main>
</template>
