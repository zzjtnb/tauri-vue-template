<script setup lang="ts">
import type { ChartConfig } from '@/components/shadcn-vue/ui/chart'
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/shadcn-vue/ui/carousel'
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/shadcn-vue/ui/chart'

interface TrafficPoint {
  index: number
  label: string
  desktop: number
  mobile: number
}

const chartData: TrafficPoint[] = [
  { index: 0, label: '周一', desktop: 126, mobile: 78 },
  { index: 1, label: '周二', desktop: 154, mobile: 92 },
  { index: 2, label: '周三', desktop: 138, mobile: 108 },
  { index: 3, label: '周四', desktop: 176, mobile: 121 },
  { index: 4, label: '周五', desktop: 192, mobile: 144 },
]

const chartConfig = {
  desktop: {
    label: '桌面端',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: '移动端',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const carouselItems = [
  { title: '组件覆盖', description: '按已安装目录补齐示例。' },
  { title: '组合规则', description: '菜单项、弹层标题、卡片结构保持可访问。' },
  { title: '验证闭环', description: '用脚本检查覆盖，用类型检查确认导入。' },
]

function xAccessor(point: TrafficPoint) {
  return point.index
}

function desktopAccessor(point: TrafficPoint) {
  return point.desktop
}

function mobileAccessor(point: TrafficPoint) {
  return point.mobile
}

function formatDay(value: number | Date) {
  const index = typeof value === 'number' ? value : value.getDate() - 1
  return chartData[index]?.label ?? ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Chart 图表
      </h3>
      <div class="gap-4 grid lg:grid-cols-[minmax(0,1fr)_260px]">
        <ChartContainer :config="chartConfig" class="p-4 border rounded-lg h-[260px]">
          <VisXYContainer :data="chartData" :height="220">
            <VisLine :x="xAccessor" :y="desktopAccessor" :color="chartConfig.desktop.color" />
            <VisLine :x="xAccessor" :y="mobileAccessor" :color="chartConfig.mobile.color" />
            <VisAxis type="x" :tick-format="formatDay" />
            <VisAxis type="y" />
          </VisXYContainer>
          <ChartLegendContent />
        </ChartContainer>

        <div class="flex flex-col gap-3">
          <p class="text-sm text-muted-foreground">
            ChartContainer 提供主题变量和上下文，ChartLegendContent 从 ChartConfig 派生图例。
          </p>
          <ChartTooltipContent
            :config="chartConfig"
            :payload="{ desktop: 192, mobile: 144 }"
            :x="4"
            :label-formatter="formatDay"
          />
        </div>
      </div>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Carousel 轮播
      </h3>
      <Carousel class="mx-10 max-w-xl relative">
        <CarouselContent>
          <CarouselItem v-for="item in carouselItems" :key="item.title">
            <div class="p-6 border rounded-lg bg-card">
              <p class="text-lg font-semibold">
                {{ item.title }}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                {{ item.description }}
              </p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
</template>
