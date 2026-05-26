<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@tauri-vue-template/ui'
import { RouterLink } from 'vue-router'

const entries = [
  { to: '/fonts', title: '字体系统', description: '查看当前 UnoCSS 字体 token、远程字体来源、字重和字号。', icon: 'i-lucide-type' },
  { to: '/themes', title: '主题配色', description: '展示 6 套主题色、36 个语义颜色 token 和组件配色效果。', icon: 'i-lucide-palette' },
  { to: '/shadcn', title: 'UI 组件', description: '按场景分类浏览当前 shadcn-vue 组件演示。', icon: 'i-lucide-package' },
  { to: '/card', title: '虚拟信用卡', description: '生成、识别和验证虚拟信用卡数据。', icon: 'i-lucide-credit-card' },
  { to: '/logo', title: 'Logo 编辑器', description: '实时编辑、预览、复制和导出 SVG Logo。', icon: 'i-lucide-image' },
  { to: '/layout', title: '布局系统演示', description: '完整演示标准布局、区域扩展、内容出口、iframe 和页签状态。', icon: 'i-lucide-layout-dashboard' },
]
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-4xl font-bold font-serif">
        示例展示
      </h1>
      <p class="text-muted-foreground">
        探索项目的字体系统、主题配色、组件示例、工具示例和布局能力
      </p>
    </div>

    <section class="gap-4 grid md:grid-cols-2 xl:grid-cols-3" aria-label="示例入口">
      <RouterLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="p-5 text-left border border-border rounded-3xl bg-card shadow-sm transition hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
      >
        <span class="text-primary mb-4 p-3 rounded-2xl bg-primary/10 inline-flex" :class="entry.icon" aria-hidden="true" />
        <h2 class="text-lg font-semibold m-0">
          {{ entry.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ entry.description }}
        </p>
      </RouterLink>
    </section>

    <Card>
      <CardHeader>
        <CardTitle>如何使用</CardTitle>
        <CardDescription>通过上方导航菜单访问不同的示例页面</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <div class="rounded-lg bg-primary/10 flex flex-shrink-0 h-10 w-10 items-center justify-center">
              <span class="i-lucide-type text-xl text-primary" />
            </div>
            <div>
              <h3 class="font-semibold">
                字体系统
              </h3>
              <p class="text-sm text-muted-foreground">
                查看项目当前使用的三种字体语义：font-sans、font-serif 和 font-mono。
                页面展示远程字体来源、系统兜底、字重、字号和真实应用场景。
              </p>
            </div>
          </div>

          <Separator />

          <div class="flex gap-3 items-start">
            <div class="rounded-lg bg-primary/10 flex flex-shrink-0 h-10 w-10 items-center justify-center">
              <span class="i-lucide-palette text-xl text-primary" />
            </div>
            <div>
              <h3 class="font-semibold">
                主题配色
              </h3>
              <p class="text-sm text-muted-foreground">
                了解 neutral、blue、violet、teal、rose、amber 六套主题的完整配色方案。
                包括基础色、交互色、语义色、侧边栏色和图表色在实际组件中的应用效果。
              </p>
            </div>
          </div>

          <Separator />

          <div class="flex gap-3 items-start">
            <div class="rounded-lg bg-primary/10 flex flex-shrink-0 h-10 w-10 items-center justify-center">
              <span class="i-lucide-package text-xl text-primary" />
            </div>
            <div>
              <h3 class="font-semibold">
                UI 组件
              </h3>
              <p class="text-sm text-muted-foreground">
                体验项目中使用的所有 Shadcn-vue 组件。组件按功能分类展示，包括基础组件、表单组件、
                浮层组件、数据展示和反馈组件。每个组件都提供了交互式演示。
              </p>
            </div>
          </div>

          <Separator />

          <div class="flex gap-3 items-start">
            <div class="rounded-lg bg-primary/10 flex flex-shrink-0 h-10 w-10 items-center justify-center">
              <span class="i-lucide-layout-dashboard text-xl text-primary" />
            </div>
            <div>
              <h3 class="font-semibold">
                布局系统演示
              </h3>
              <p class="text-sm text-muted-foreground">
                完整演示标准布局、区域预设、命名视图、显式 slots、内容出口、iframe 和页签状态。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="gap-4 grid lg:grid-cols-4 md:grid-cols-2">
      <Card>
        <CardHeader class="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">
            字体系统
          </CardTitle>
          <span class="i-lucide-type text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            3 种语义
          </div>
          <p class="text-xs text-muted-foreground">
            sans · serif · mono
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">
            主题配色
          </CardTitle>
          <span class="i-lucide-palette text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            36 个 token
          </div>
          <p class="text-xs text-muted-foreground">
            6 套主题色
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">
            UI 组件
          </CardTitle>
          <span class="i-lucide-package text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            60 个组件目录
          </div>
          <p class="text-xs text-muted-foreground">
            shadcn-vue/ui
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">
            布局系统
          </CardTitle>
          <span class="i-lucide-layout-dashboard text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            4 类能力
          </div>
          <p class="text-xs text-muted-foreground">
            标准 · 区域 · 出口 · 状态
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
