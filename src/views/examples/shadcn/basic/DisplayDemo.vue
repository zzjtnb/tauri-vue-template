<script setup lang="ts">
import { shallowRef } from 'vue'
import { AspectRatio } from '@/components/shadcn-vue/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-vue/ui/avatar'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shadcn-vue/ui/collapsible'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/shadcn-vue/ui/item'
import { Kbd, KbdGroup } from '@/components/shadcn-vue/ui/kbd'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const open = shallowRef(true)

const teammates = [
  { name: 'He Bing', role: 'Owner', fallback: 'HB' },
  { name: 'AI Agent', role: 'Assistant', fallback: 'AI' },
]

const ratios = [
  { label: '16:9 封面', ratio: 16 / 9, class: 'col-span-2' },
  { label: '1:1 头像', ratio: 1, class: '' },
  { label: '4:3 卡片', ratio: 4 / 3, class: '' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="gap-4 grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          AspectRatio 比例容器
        </h3>
        <div class="gap-3 grid grid-cols-2 max-w-[360px]">
          <AspectRatio
            v-for="item in ratios"
            :key="item.label"
            :ratio="item.ratio"
            class="border rounded-lg bg-muted overflow-hidden"
            :class="item.class"
          >
            <div class="p-4 flex flex-col h-full justify-between from-background to-muted bg-gradient-to-br">
              <span class="text-xs text-muted-foreground">{{ item.label }}</span>
              <span class="text-sm font-medium">宽度变化时高度自动派生</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div class="gap-4 grid md:grid-cols-2">
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold">
            Avatar 头像
          </h3>
          <div class="flex gap-3 items-center">
            <Avatar v-for="member in teammates" :key="member.name">
              <AvatarImage src="/logo.svg" :alt="member.name" />
              <AvatarFallback>{{ member.fallback }}</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>离</AvatarFallback>
            </Avatar>
          </div>
          <p class="text-sm text-muted-foreground leading-6 m-0">
            Avatar 始终提供 AvatarFallback，图片加载失败时仍可读。
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold">
            Kbd 快捷键
          </h3>
          <div class="flex flex-wrap gap-3 items-center">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <KbdGroup>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
          </div>
          <p class="text-sm text-muted-foreground leading-6 m-0">
            KbdGroup 表达组合键，单个 Kbd 表达独立按键。
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Collapsible 折叠区
      </h3>
      <Collapsible v-model:open="open" class="p-4 border rounded-lg">
        <div class="flex gap-4 items-center justify-between">
          <div>
            <p class="font-medium m-0">
              示例调试面板
            </p>
            <p class="text-sm text-muted-foreground mb-0 mt-1">
              当前状态：{{ open ? '已展开' : '已折叠' }}
            </p>
          </div>
          <CollapsibleTrigger as-child>
            <Button variant="outline" size="sm">
              {{ open ? '收起' : '展开' }}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent class="mt-4 flex flex-col gap-2">
          <p class="text-sm m-0 p-3 rounded-md bg-muted">
            这里放只在展开状态展示的调试信息或高级选项。
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Item 列表项
      </h3>
      <ItemGroup class="border rounded-lg overflow-hidden">
        <Item variant="default" class="rounded-none">
          <ItemMedia variant="icon">
            <span class="i-lucide-bot" aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemHeader>
              <ItemTitle>代理运行状态</ItemTitle>
              <ItemDescription>已连接模型、工具和本地工作区。</ItemDescription>
            </ItemHeader>
            <ItemFooter>
              <span>最后同步：刚刚</span>
            </ItemFooter>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              查看
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item variant="muted" size="sm" class="rounded-none">
          <ItemMedia variant="icon">
            <span class="i-lucide-check" aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>示例覆盖检查</ItemTitle>
            <ItemDescription>Item 组件可承载标题、描述、媒体、页脚和操作区。</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  </div>

  <Separator />
</template>
