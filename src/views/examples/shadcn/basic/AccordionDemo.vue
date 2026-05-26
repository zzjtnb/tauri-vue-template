<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/shadcn-vue/ui/accordion'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const items = [
  { value: 'item-1', title: '可访问性（默认展开）', content: '支持键盘导航和屏幕阅读器。' },
  { value: 'item-2', title: '样式定制', content: '可以通过 CSS 变量自定义样式。' },
  { value: 'item-3', title: '动画效果', content: '内置平滑的展开收起动画。' },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Accordion 手风琴
    </h3>
    <Accordion type="single" collapsible default-value="item-1">
      <AccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <AccordionTrigger>{{ item.title }}</AccordionTrigger>
        <AccordionContent>
          {{ item.content }}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <p class="text-sm text-muted-foreground">
      点击标题可展开/收起内容
    </p>
  </div>

  <Separator />
</template>
