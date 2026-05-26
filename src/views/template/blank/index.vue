<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/shadcn-vue/ui/button'

const panels = [
  {
    title: '沉浸式画布',
    description: '不渲染应用顶部栏和侧边栏，适合编辑器、仪表盘大屏、地图和全屏工作流。',
    icon: 'i-lucide-maximize-2',
  },
  {
    title: '自带返回路径',
    description: '空白布局需要在页面内部提供返回、保存、退出等关键操作。',
    icon: 'i-lucide-route',
  },
  {
    title: '边界独立',
    description: '页面自己承担标题、操作区和状态反馈，不依赖布局壳默认区域。',
    icon: 'i-lucide-box',
  },
] as const
</script>

<template>
  <main class="p-4 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_28rem),linear-gradient(145deg,hsl(var(--background)),hsl(var(--muted)/0.75))] min-h-[100dvh] md:p-8">
    <section class="mx-auto p-6 border rounded-[2rem] bg-card/80 flex flex-col gap-8 max-w-7xl min-h-[calc(100dvh-4rem)] shadow-foreground/5 shadow-xl justify-between backdrop-blur md:p-10">
      <header class="flex flex-wrap gap-3 items-center justify-between">
        <div class="text-xs text-primary tracking-[0.16em] font-bold px-3 py-1 border border-primary/15 rounded-full bg-primary/10 inline-flex gap-2 uppercase items-center">
          <span class="i-lucide-square size-4" aria-hidden="true" />
          Blank Template
        </div>
        <Button as-child variant="outline" class="rounded-full">
          <RouterLink to="/">
            <span class="i-lucide-arrow-left size-4" aria-hidden="true" />
            返回模板选择
          </RouterLink>
        </Button>
      </header>

      <div class="gap-8 grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div class="min-w-0">
          <h1 class="text-4xl leading-tight tracking-[-0.06em] font-black max-w-3xl md:text-6xl">
            空白布局模板
          </h1>
          <p class="text-base text-muted-foreground leading-8 mt-5 max-w-2xl md:text-lg">
            这是最少布局壳的模板：没有顶部栏、侧边栏、页签和面包屑，页面自身负责完整体验和退出路径。
          </p>
        </div>

        <div class="gap-3 grid">
          <article v-for="panel in panels" :key="panel.title" class="p-5 border rounded-[1.75rem] bg-background/70 shadow-sm">
            <div class="flex gap-4">
              <span class="text-primary rounded-2xl bg-primary/10 shrink-0 grid size-11 place-items-center">
                <span class="size-5" :class="panel.icon" aria-hidden="true" />
              </span>
              <span class="min-w-0">
                <span class="text-base tracking-[-0.02em] font-bold block">{{ panel.title }}</span>
                <span class="text-sm text-muted-foreground leading-6 mt-1 block">{{ panel.description }}</span>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
