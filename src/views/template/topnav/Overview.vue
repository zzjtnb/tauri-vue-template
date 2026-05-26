<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/shadcn-vue/ui/button'

const props = defineProps<{
  title: string
  version: string
}>()
</script>

<template>
  <section class="p-6 border rounded-[2rem] bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_34rem),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted))_100%)] shadow-foreground/5 shadow-xl relative overflow-hidden md:p-10">
    <div class="rounded-full bg-primary/15 size-72 absolute blur-3xl -right-28 -top-28" aria-hidden="true" />
    <div class="h-px w-full bottom-0 left-0 absolute from-transparent to-transparent via-primary/40 bg-gradient-to-r" aria-hidden="true" />

    <div class="gap-8 grid relative xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
      <div class="space-y-7">
        <div class="text-sm text-muted-foreground px-3 py-1 border rounded-full bg-background/70 inline-flex gap-2 items-center backdrop-blur">
          <span class="i-lucide-panels-top-left text-primary size-4" aria-hidden="true" />
          Tauri 2 · Vue 3 · Topnav v{{ props.version }}
        </div>

        <div class="space-y-4">
          <h1 class="text-4xl text-foreground tracking-tight font-black max-w-4xl md:text-6xl">
            {{ props.title }}
          </h1>
          <p class="text-base text-muted-foreground leading-8 max-w-2xl md:text-lg">
            这是顶部导航应用模板：保留顶部导航、布局设置、桌面与文件能力、Mock API 和示例隔离边界，适合作为标准业务系统起点。
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <Button as-child class="font-bold px-5 rounded-full h-11">
            <RouterLink to="/">
              返回模板选择
              <span class="i-lucide-arrow-left size-4" aria-hidden="true" />
            </RouterLink>
          </Button>
          <Button as-child variant="outline" class="font-bold px-5 rounded-full h-11">
            <RouterLink to="/template/workspace">
              智能工作台模板
              <span class="i-lucide-bot size-4" aria-hidden="true" />
            </RouterLink>
          </Button>
          <Button as-child variant="ghost" class="font-bold px-5 rounded-full h-11">
            <RouterLink to="/settings">
              配置模板
              <span class="i-lucide-settings-2 size-4" aria-hidden="true" />
            </RouterLink>
          </Button>
        </div>
      </div>

      <aside class="p-5 border rounded-[1.5rem] bg-background/75 backdrop-blur">
        <p class="text-sm text-muted-foreground font-semibold">
          顶部导航模板职责
        </p>
        <dl class="text-sm mt-4 gap-3 grid">
          <div class="flex gap-4 items-center justify-between">
            <dt class="text-muted-foreground">
              选择页
            </dt>
            <dd class="font-semibold">
              /
            </dd>
          </div>
          <div class="flex gap-4 items-center justify-between">
            <dt class="text-muted-foreground">
              当前模板
            </dt>
            <dd class="font-semibold">
              /template/topnav
            </dd>
          </div>
          <div class="flex gap-4 items-center justify-between">
            <dt class="text-muted-foreground">
              设置
            </dt>
            <dd class="font-semibold">
              /settings
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  </section>
</template>
