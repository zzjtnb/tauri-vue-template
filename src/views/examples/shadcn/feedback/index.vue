<script setup lang="ts">
import { CircleAlertIcon, OctagonXIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-vue/ui/alert'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/shadcn-vue/ui/empty'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import { Skeleton } from '@/components/shadcn-vue/ui/skeleton'
import { Toaster } from '@/components/shadcn-vue/ui/sonner'
import { Spinner } from '@/components/shadcn-vue/ui/spinner'
import ProgressDemo from './ProgressDemo.vue'

const alerts = [
  { variant: 'default' as const, icon: CircleAlertIcon, title: '默认提示', description: '这是一个普通的提示信息（默认样式）。' },
  { variant: 'destructive' as const, icon: OctagonXIcon, title: '错误提示', description: '发生错误，请稍后重试（destructive 变体）。' },
]

const spinnerSizes = ['size-3', '', 'size-6']

const skeletons = [
  { width: 'w-[250px]' },
  { width: 'w-[200px]' },
  { width: 'w-[150px]' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Alert 提示 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Alert 提示
      </h3>
      <div class="flex flex-col gap-3">
        <Alert v-for="alert in alerts" :key="alert.variant" :variant="alert.variant">
          <component :is="alert.icon" aria-hidden="true" />
          <AlertTitle>{{ alert.title }}</AlertTitle>
          <AlertDescription>
            {{ alert.description }}
          </AlertDescription>
        </Alert>
      </div>
      <p class="text-sm text-muted-foreground">
        注：shadcn-vue Alert 组件只有 default 和 destructive 两种变体。如需其他样式，应在主题中配置，而不是添加自定义类。
      </p>
    </div>

    <Separator />

    <!-- Spinner 加载 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Spinner 加载
      </h3>
      <div class="flex gap-4 items-center">
        <Spinner v-for="(size, index) in spinnerSizes" :key="index" :class="size" />
      </div>
    </div>

    <Separator />

    <!-- Skeleton 骨架屏 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Skeleton 骨架屏
      </h3>
      <div class="flex flex-col gap-3">
        <Skeleton v-for="(skeleton, index) in skeletons" :key="index" class="h-4" :class="[skeleton.width]" />
      </div>
    </div>

    <Separator />

    <!-- Sonner Toast 通知 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Sonner Toast 通知
      </h3>
      <Toaster rich-colors position="bottom-right" />
      <div class="flex flex-wrap gap-2">
        <Button @click="toast('这是一条普通消息')">
          普通消息
        </Button>
        <Button variant="secondary" @click="toast.success('操作成功！')">
          成功消息
        </Button>
        <Button variant="destructive" @click="toast.error('请求失败！')">
          错误消息
        </Button>
        <Button variant="outline" @click="toast.info('这是一条提示信息')">
          提示消息
        </Button>
        <Button variant="outline" @click="toast.warning('这是一条警告信息')">
          警告消息
        </Button>
        <Button
          variant="outline"
          @click="toast('带操作的消息', {
            action: {
              label: '撤销',
              onClick: () => toast('已撤销'),
            },
          })"
        >
          带操作按钮
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">
        点击按钮查看不同类型的 Toast 通知效果。
      </p>
    </div>

    <Separator />

    <ProgressDemo />

    <Separator />

    <!-- Empty 空状态 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Empty 空状态
      </h3>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>暂无数据</EmptyTitle>
          <EmptyDescription>
            当前没有任何内容可显示
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>创建新项目</Button>
        </EmptyContent>
      </Empty>
    </div>
  </div>
</template>
