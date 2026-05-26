<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const route = useRoute()
const draft = ref('这个输入框用于验证 KeepAlive：切到其他演示页再回来，内容应保留。')
const count = ref(0)
const currentId = computed(() => `${route.params.id ?? 'default'}`)

const links = [
  { to: '/layout/state/cache/alpha', label: '实例 alpha' },
  { to: '/layout/state/cache/beta', label: '实例 beta' },
  { to: '/layout/state/cache/gamma', label: '实例 gamma' },
]
</script>

<template>
  <ShowcaseFrame
    eyebrow="Tabs and cache"
    title="页签、KeepAlive 与 cacheKey"
    description="当前路由声明 keepAlive=true 与 cacheKey。布局层会把已访问路由写入页签，并用 KeepAlive 缓存需要保留的页面实例。"
  >
    <section class="gap-3 grid md:grid-cols-3" aria-label="缓存实例切换">
      <RouterLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="p-4 border rounded-2xl bg-card transition hover:border-primary/50 hover:bg-primary/5"
        :class="route.fullPath === item.to ? 'border-primary bg-primary/5' : 'border-border'"
      >
        {{ item.label }}
      </RouterLink>
    </section>

    <section class="gap-4 grid lg:grid-cols-[1fr_22rem]" aria-label="缓存状态验证">
      <article class="p-5 border border-border rounded-3xl bg-card">
        <h2 class="text-lg font-semibold m-0">
          可编辑状态
        </h2>
        <textarea v-model="draft" class="text-sm mt-4 p-3 outline-none border border-border rounded-2xl bg-background min-h-32 w-full focus:border-primary" aria-label="KeepAlive 验证输入框" />
        <div class="mt-4 flex flex-wrap gap-2 items-center">
          <button type="button" class="text-sm px-3 py-2 border border-border rounded-xl bg-background hover:bg-accent" @click="count += 1">
            点击计数：{{ count }}
          </button>
          <span class="text-sm text-muted-foreground">当前实例：{{ currentId }}</span>
        </div>
      </article>

      <aside class="p-5 border border-border rounded-3xl bg-background">
        <h2 class="text-lg font-semibold m-0">
          验证点
        </h2>
        <ul class="text-sm text-muted-foreground leading-7 mb-0 mt-3 pl-5">
          <li>页签栏会记录当前访问页。</li>
          <li>关闭其他/左侧/右侧/全部由布局 tabs adapter 处理。</li>
          <li>KeepAlive 缓存由 route.meta.keepAlive 和 tabs 缓存集合共同决定。</li>
          <li>cacheKey 用于控制同一路由参数下的实例复用策略。</li>
        </ul>
      </aside>
    </section>
  </ShowcaseFrame>
</template>
