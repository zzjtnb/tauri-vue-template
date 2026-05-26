<script setup lang="ts">
import type { Layout } from '@tauri-vue-template/ui'
import { Avatar, AvatarFallback, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@tauri-vue-template/ui'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<Layout['Area']['Props']>()

const sidebar = computed(() => props.context.area?.region === 'sidebar')
const collapsed = computed(() => sidebar.value && props.context.sidebar.collapsed)
const rootClass = computed(() => sidebar.value ? 'flex min-w-0 w-full items-center' : 'flex items-center justify-end')
const buttonClass = computed(() => [
  'rounded-2xl bg-card/55 h-10 shadow-none backdrop-blur hover:bg-accent',
  sidebar.value ? 'w-full min-w-0 justify-start px-3 gap-3' : 'px-2 pr-3 gap-3',
  collapsed.value && 'justify-center px-2',
])
const labelClass = computed(() => collapsed.value ? 'sr-only' : 'text-left min-w-0 max-md:hidden block')
const chevronClass = computed(() => collapsed.value ? 'sr-only' : 'i-lucide-chevron-down text-muted-foreground size-4 shrink-0')

const menuItems = [
  {
    to: '/',
    label: '模板选择',
    description: '返回模板入口',
    icon: 'i-lucide-layout-template',
  },
  {
    to: '/topnav',
    label: '顶部导航模板',
    description: '标准业务应用骨架',
    icon: 'i-lucide-panels-top-left',
  },
  {
    to: '/sidebar',
    label: '侧边栏布局模板',
    description: '左侧导航应用骨架',
    icon: 'i-lucide-panel-left',
  },
  {
    to: '/hybrid',
    label: '混合布局模板',
    description: '顶部导航和左侧导航骨架',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    to: '/blank',
    label: '空白布局模板',
    description: '沉浸式页面骨架',
    icon: 'i-lucide-square',
  },
  {
    to: '/workspace',
    label: '智能工作台模板',
    description: '自定义布局工作台',
    icon: 'i-lucide-bot',
  },
  {
    to: '/settings',
    label: '模板设置',
    description: '主题、系统和原生能力',
    icon: 'i-lucide-settings-2',
  },
] as const
</script>

<template>
  <div :class="rootClass">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button type="button" variant="ghost" :class="buttonClass">
          <Avatar class="border border-primary/15 bg-primary/10 size-7">
            <AvatarFallback class="text-xs text-primary font-black bg-transparent">
              AI
            </AvatarFallback>
          </Avatar>
          <span :class="labelClass">
            <span class="text-xs leading-none font-semibold block truncate">工作台模板</span>
            <span class="text-[0.68rem] text-muted-foreground leading-none mt-1 block truncate">展开模板入口</span>
          </span>
          <span :class="chevronClass" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="p-2 rounded-2xl w-72">
        <DropdownMenuLabel class="p-3">
          <span class="text-sm font-bold block">智能工作台模板</span>
          <span class="text-xs text-muted-foreground leading-5 mt-1 block">自定义顶部栏、侧栏和工作区内容的模板骨架。</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          v-for="item in menuItems"
          :key="item.to"
          as-child
          class="p-0 rounded-xl"
        >
          <RouterLink :to="item.to" class="px-3 py-2.5 flex gap-3 w-full items-start">
            <span class="text-primary mt-0.5 shrink-0 size-4" :class="item.icon" aria-hidden="true" />
            <span class="min-w-0">
              <span class="text-sm font-medium block">{{ item.label }}</span>
              <span class="text-xs text-muted-foreground leading-5 block">{{ item.description }}</span>
            </span>
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
