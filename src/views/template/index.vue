<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/shadcn-vue/ui/button'

const templates = [
  {
    title: '顶部导航模板',
    subtitle: 'Topnav Application',
    description: '面向标准业务系统的顶部导航骨架，适合以模块导航、设置入口和常规内容页为主的应用。',
    to: '/template/topnav',
    icon: 'i-lucide-panels-top-left',
    accent: 'from-blue-500/25 via-cyan-500/10 to-transparent',
    preview: ['顶部导航', '设置入口', '标准内容页'],
  },
  {
    title: '侧边栏布局模板',
    subtitle: 'Sidebar Application',
    description: '面向后台管理和资源目录的侧边栏骨架，左侧承载主导航，内容区保持稳定工作面。',
    to: '/template/sidebar',
    icon: 'i-lucide-panel-left',
    accent: 'from-emerald-500/25 via-teal-500/10 to-transparent',
    preview: ['侧边栏导航', '模块层级', '内容工作面'],
  },
  {
    title: '混合布局模板',
    subtitle: 'Hybrid Application',
    description: '面向复杂控制台的标准混合布局骨架，同时保留顶部导航和左侧侧边栏。',
    to: '/template/hybrid',
    icon: 'i-lucide-layout-dashboard',
    accent: 'from-orange-500/25 via-amber-500/10 to-transparent',
    preview: ['顶部导航', '侧边栏', '标准内容区'],
  },
  {
    title: '空白布局模板',
    subtitle: 'Blank Canvas',
    description: '面向编辑器、大屏和沉浸式页面的空白布局骨架，页面内部自行承载标题、操作和退出路径。',
    to: '/template/blank',
    icon: 'i-lucide-square',
    accent: 'from-slate-500/25 via-zinc-500/10 to-transparent',
    preview: ['沉浸画布', '自带返回', '独立操作区'],
  },
  {
    title: '智能工作台模板',
    subtitle: 'Custom Workspace',
    description: '面向任务推进和智能助手场景的特殊自定义布局，包含品牌区、模板入口、活动流和命令栏。',
    to: '/template/workspace',
    icon: 'i-lucide-bot',
    accent: 'from-violet-500/25 via-fuchsia-500/10 to-transparent',
    preview: ['自定义布局', '活动流', '命令栏'],
  },
] as const

const stats = [
  { label: '标准模板', value: '5' },
  { label: '独立路由', value: 'children' },
  { label: '入口路径', value: '/' },
] as const

const principles = [
  {
    title: '入口清晰',
    description: '/ 只负责模板选择，不绑定某一种具体骨架。',
    icon: 'i-lucide-route',
  },
  {
    title: '结构独立',
    description: '每种模板都有自己的目录、页面和布局声明。',
    icon: 'i-lucide-folder-tree',
  },
  {
    title: '复制友好',
    description: '按布局风格组织内容，方便后续复制、替换或删除。',
    icon: 'i-lucide-copy-check',
  },
] as const
</script>

<template>
  <main class="mx-auto p-3 gap-4 grid max-w-7xl w-full md:p-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-stretch">
    <section class="p-5 border rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.20),transparent_22rem),linear-gradient(145deg,hsl(var(--card)),hsl(var(--muted)/0.72))] shadow-foreground/5 shadow-xl relative overflow-hidden md:p-6 xl:min-h-[32rem]">
      <div class="rounded-full bg-primary/15 size-64 absolute blur-3xl -left-28 -top-28" aria-hidden="true" />
      <div class="rounded-full bg-accent/40 size-60 right-0 absolute blur-3xl -bottom-32" aria-hidden="true" />

      <div class="flex flex-col gap-6 h-full justify-between relative">
        <div class="space-y-6">
          <div class="text-sm text-primary px-3 py-1 border border-primary/15 rounded-full bg-background/70 inline-flex gap-2 items-center backdrop-blur">
            <span class="i-lucide-layout-template size-4" aria-hidden="true" />
            Template Gallery
          </div>

          <div class="space-y-4">
            <h1 class="text-4xl tracking-tight font-black max-w-xl md:text-6xl">
              选择一个应用骨架开始
            </h1>
            <p class="text-base text-muted-foreground leading-8 max-w-2xl md:text-lg">
              从顶部导航、侧边栏、混合布局、空白画布和自定义工作台中选择起点。标准模板会跟随设置面板的布局模式，工作台保持自己的自定义布局。
            </p>
          </div>

          <dl class="gap-3 grid 2xl:grid-cols-3 sm:grid-cols-3 xl:grid-cols-1">
            <div v-for="item in stats" :key="item.label" class="p-4 border rounded-2xl bg-background/70 backdrop-blur">
              <dt class="text-xs text-muted-foreground font-medium">
                {{ item.label }}
              </dt>
              <dd class="text-xl text-foreground tracking-[-0.03em] font-black mt-2">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="text-sm text-muted-foreground gap-3 grid">
          <article v-for="item in principles" :key="item.title" class="p-4 border rounded-2xl bg-background/70 flex gap-3 backdrop-blur">
            <span class="text-primary rounded-xl bg-primary/10 shrink-0 grid size-9 place-items-center">
              <span class="size-4" :class="item.icon" aria-hidden="true" />
            </span>
            <span class="min-w-0">
              <span class="text-foreground font-bold block">{{ item.title }}</span>
              <span class="leading-6 mt-1 block">{{ item.description }}</span>
            </span>
          </article>
        </div>
      </div>
    </section>

    <section aria-label="模板列表" class="gap-4 grid md:grid-cols-2">
      <RouterLink
        v-for="item in templates"
        :key="item.to"
        :to="item.to"
        class="group p-5 border border-border/80 rounded-[2rem] bg-card min-h-64 shadow-sm transition-all relative overflow-hidden md:p-6 focus-visible:outline-none hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-ring hover:shadow-foreground/5 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="opacity-80 transition-opacity inset-0 absolute bg-gradient-to-br group-hover:opacity-100" :class="item.accent" aria-hidden="true" />
        <div class="flex flex-col gap-8 h-full justify-between relative">
          <div class="flex gap-4 items-start justify-between">
            <div class="min-w-0 space-y-2">
              <p class="text-xs text-primary tracking-[0.16em] font-bold uppercase">
                {{ item.subtitle }}
              </p>
              <h2 class="text-2xl tracking-tight font-black md:text-3xl">
                {{ item.title }}
              </h2>
              <p class="text-sm text-muted-foreground leading-6 max-w-2xl">
                {{ item.description }}
              </p>
            </div>
            <div class="text-primary rounded-3xl bg-background/80 shrink-0 grid size-14 shadow-sm transition-transform place-items-center backdrop-blur group-hover:scale-105">
              <span :class="item.icon" class="size-6" aria-hidden="true" />
            </div>
          </div>

          <div class="gap-4 grid">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="label in item.preview"
                :key="label"
                class="text-xs text-muted-foreground px-3 py-1 border rounded-full bg-background/70 backdrop-blur"
              >
                {{ label }}
              </span>
            </div>

            <div class="flex gap-3 items-center justify-between">
              <span class="text-xs text-muted-foreground">打开 {{ item.title }}</span>
              <Button as-child class="font-bold rounded-full pointer-events-none">
                <span>
                  进入
                  <span class="i-lucide-arrow-right size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </RouterLink>
    </section>
  </main>
</template>
