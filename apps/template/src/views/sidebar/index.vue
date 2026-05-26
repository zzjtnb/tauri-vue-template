<script setup lang="ts">
const sections = [
  {
    title: '主导航优先',
    description: '把核心模块放在左侧常驻导航里，内容区专注展示当前页面。',
    icon: 'i-lucide-panel-left',
  },
  {
    title: '层级清晰',
    description: '适合后台管理、资源目录、配置中心等需要稳定菜单层级的系统。',
    icon: 'i-lucide-list-tree',
  },
  {
    title: '内容稳定',
    description: '顶部栏保留全局操作，侧栏承接页面切换，减少内容区跳动。',
    icon: 'i-lucide-layout-dashboard',
  },
] as const

const metrics = [
  { label: '导航模式', value: 'sidebar' },
  { label: '菜单位置', value: 'left' },
  { label: '内容密度', value: 'standard' },
  { label: '设置入口', value: 'header' },
] as const
</script>

<template>
  <main class="mx-auto p-4 flex flex-col gap-6 max-w-7xl w-full md:p-8">
    <section class="border rounded-[2rem] bg-card shadow-sm overflow-hidden">
      <div class="p-6 gap-6 grid md:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="min-w-0">
          <span class="text-xs text-primary tracking-[0.16em] font-bold px-3 py-1 border border-primary/15 rounded-full bg-primary/10 inline-flex gap-2 uppercase items-center">
            <span class="i-lucide-panel-left size-4" aria-hidden="true" />
            Sidebar Template
          </span>
          <h1 class="text-4xl leading-tight tracking-[-0.055em] font-black mt-5 max-w-3xl md:text-6xl">
            侧边栏布局模板
          </h1>
          <p class="text-sm text-muted-foreground leading-7 mt-4 max-w-2xl md:text-base">
            用常驻侧栏承载主导航，顶部栏保留品牌和设置入口，适合信息架构稳定、模块层级明确的应用骨架。
          </p>
        </div>

        <dl class="p-3 border rounded-3xl bg-background/70 gap-2 grid">
          <div v-for="metric in metrics" :key="metric.label" class="text-sm px-3 py-2 rounded-2xl bg-muted/50 flex gap-3 items-center justify-between">
            <dt class="text-muted-foreground">
              {{ metric.label }}
            </dt>
            <dd class="text-foreground font-semibold">
              {{ metric.value }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section aria-label="侧边栏模板能力" class="gap-3 grid md:grid-cols-3">
      <article v-for="section in sections" :key="section.title" class="p-5 border rounded-[1.75rem] bg-card shadow-sm">
        <span class="text-primary rounded-2xl bg-primary/10 grid size-10 place-items-center">
          <span class="size-5" :class="section.icon" aria-hidden="true" />
        </span>
        <h2 class="text-lg tracking-[-0.02em] font-bold mt-5">
          {{ section.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mt-2">
          {{ section.description }}
        </p>
      </article>
    </section>
  </main>
</template>
