<script setup lang="ts">
const cards = [
  {
    title: '顶部全局入口',
    description: '顶部栏承载品牌、主导航和设置入口，保持跨页面操作一致。',
    icon: 'i-lucide-panels-top-left',
  },
  {
    title: '左侧模块导航',
    description: '侧边栏承载模块层级和页面切换，适合复杂后台和控制台。',
    icon: 'i-lucide-panel-left',
  },
  {
    title: '内容区工作面',
    description: '内容区保留标准边距、页签和面包屑，适合常规业务页面。',
    icon: 'i-lucide-layout-dashboard',
  },
] as const

const meta = [
  { label: '初始布局', value: 'hybrid' },
  { label: '顶部导航', value: 'enabled' },
  { label: '侧边栏', value: 'enabled' },
  { label: '设置跟随', value: 'enabled' },
] as const
</script>

<template>
  <main class="mx-auto p-4 flex flex-col gap-6 max-w-7xl w-full md:p-8">
    <section class="border rounded-[2rem] bg-card shadow-sm overflow-hidden">
      <div class="p-6 gap-6 grid md:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="min-w-0">
          <span class="text-xs text-primary tracking-[0.16em] font-bold px-3 py-1 border border-primary/15 rounded-full bg-primary/10 inline-flex gap-2 uppercase items-center">
            <span class="i-lucide-layout-dashboard size-4" aria-hidden="true" />
            Hybrid Template
          </span>
          <h1 class="text-4xl leading-tight tracking-[-0.055em] font-black mt-5 max-w-3xl md:text-6xl">
            混合布局模板
          </h1>
          <p class="text-sm text-muted-foreground leading-7 mt-4 max-w-2xl md:text-base">
            同时保留顶部导航和左侧导航，适合模块多、层级深、又需要全局操作区的标准应用骨架。
          </p>
        </div>

        <dl class="p-3 border rounded-3xl bg-background/70 gap-2 grid">
          <div v-for="item in meta" :key="item.label" class="text-sm px-3 py-2 rounded-2xl bg-muted/50 flex gap-3 items-center justify-between">
            <dt class="text-muted-foreground">
              {{ item.label }}
            </dt>
            <dd class="text-foreground font-semibold">
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section aria-label="混合布局模板能力" class="gap-3 grid md:grid-cols-3">
      <article v-for="card in cards" :key="card.title" class="p-5 border rounded-[1.75rem] bg-card shadow-sm">
        <span class="text-primary rounded-2xl bg-primary/10 grid size-10 place-items-center">
          <span class="size-5" :class="card.icon" aria-hidden="true" />
        </span>
        <h2 class="text-lg tracking-[-0.02em] font-bold mt-5">
          {{ card.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mt-2">
          {{ card.description }}
        </p>
      </article>
    </section>
  </main>
</template>
