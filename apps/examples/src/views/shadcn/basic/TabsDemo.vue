<script setup lang="ts">
import { Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@tauri-vue-template/ui'

const tabs = [
  { value: 'tab1', label: '标签 1（默认激活）', content: '这是标签 1 的内容' },
  { value: 'tab2', label: '标签 2', content: '这是标签 2 的内容' },
  { value: 'tab3', label: '标签 3', content: '这是标签 3 的内容' },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Tabs 标签页
    </h3>
    <Tabs default-value="tab1">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="mt-4">
        <p class="text-sm">
          {{ tab.content }}
        </p>
      </TabsContent>
    </Tabs>
    <p class="text-sm text-muted-foreground">
      点击标签切换内容，激活的标签会高亮显示
    </p>
  </div>

  <Separator />
</template>
