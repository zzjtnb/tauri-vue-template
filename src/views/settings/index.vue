<script setup lang="ts">
import type { Component } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { computed, defineAsyncComponent, shallowRef } from 'vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn-vue/ui/toggle-group'

type TabKey = 'theme' | 'native' | 'system'

interface Tab {
  key: TabKey
  label: string
  component: Component
}

const tauriAvailable = isTauri()
const activeTab = shallowRef<TabKey>('theme')
const Theme = defineAsyncComponent(() => import('./theme/index.vue'))
const Native = defineAsyncComponent(() => import('./native/index.vue'))
const System = defineAsyncComponent(() => import('./system/index.vue'))

const nativeTab: Tab = {
  key: 'native',
  label: '桌面与文件',
  component: Native,
}
const tabs: Tab[] = [
  {
    key: 'theme',
    label: '主题与布局',
    component: Theme,
  },
  ...(tauriAvailable ? [nativeTab] : []),
  {
    key: 'system',
    label: '系统信息',
    component: System,
  },
]
const active = computed(() => tabs.find(tab => tab.key === activeTab.value) || tabs[0])

function selectTab(value: unknown): void {
  const target = tabs.find(tab => tab.key === value)
  if (target) {
    activeTab.value = target.key
  }
}
</script>

<template>
  <div class="px-4 pb-4 pt-2 gap-3 grid w-full md:px-6 md:pt-3">
    <div class="border-b border-border/70">
      <ToggleGroup
        type="single"
        :model-value="activeTab"
        class="rounded-none flex-wrap gap-6 w-full justify-start"
        @update:model-value="selectTab"
      >
        <ToggleGroupItem
          v-for="tab in tabs"
          :key="tab.key"
          :value="tab.key"
          class="text-muted-foreground px-0 border-x-0 border-b-2 border-t-0 border-transparent bg-transparent h-11 shadow-none data-[state=on]:text-primary hover:text-foreground data-[state=on]:border-primary !rounded-none data-[state=on]:bg-transparent hover:bg-transparent data-[state=on]:shadow-none"
        >
          {{ tab.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <component :is="active.component" />
  </div>
</template>
