<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { shadcnEntries } from '@/views/examples/shadcn/routes'
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold font-serif">
        Shadcn-vue 组件
      </h1>
      <p class="text-muted-foreground">
        按使用场景组织当前组件示例，菜单分组与目录结构保持一致；已安装 UI 组件目录共 60 个。
      </p>
    </div>

    <section class="gap-4 grid xl:grid-cols-3" aria-label="组件分组入口">
      <article v-for="group in shadcnEntries" :key="group.title" class="p-5 border border-border rounded-3xl bg-card flex flex-col gap-4 shadow-sm">
        <div class="flex gap-3 items-start">
          <span class="text-primary p-3 rounded-2xl bg-primary/10 shrink-0" :class="group.icon" aria-hidden="true" />
          <div class="min-w-0">
            <h2 class="text-lg font-semibold m-0">
              {{ group.title }}
            </h2>
            <p class="text-sm text-muted-foreground leading-6 mb-0 mt-1">
              {{ group.description }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <RouterLink
            v-for="page in group.pages"
            :key="page.to"
            :to="page.to"
            class="p-3 border border-border rounded-2xl bg-background flex gap-3 transition items-start hover:border-primary/50 hover:bg-primary/5"
          >
            <span class="text-muted-foreground mt-0.5 shrink-0" :class="page.icon" aria-hidden="true" />
            <span class="min-w-0">
              <span class="text-sm font-medium block">{{ page.title }}</span>
              <span class="text-xs text-muted-foreground leading-5 mt-1 block">{{ page.description }}</span>
            </span>
          </RouterLink>
        </div>
      </article>
    </section>
  </div>
</template>
