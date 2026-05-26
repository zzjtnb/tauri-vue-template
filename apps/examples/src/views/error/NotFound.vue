<script setup lang="ts">
import { Button } from '@tauri-vue-template/ui'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.replace('/')
}
</script>

<template>
  <main class="text-foreground p-4 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_32rem)] overflow-hidden min-h-dvh md:p-8">
    <section class="mx-auto p-6 border rounded-[2rem] bg-card/90 grid max-w-6xl min-h-[calc(100dvh-4rem)] shadow-2xl shadow-foreground/10 place-items-center relative backdrop-blur md:p-10">
      <div class="bg-[linear-gradient(115deg,transparent_0%,hsl(var(--muted)/0.9)_42%,transparent_74%)] inset-0 absolute -z-1" aria-hidden="true" />
      <div class="h-24 w-px hidden left-8 top-8 absolute from-primary/70 to-transparent bg-gradient-to-b md:block" aria-hidden="true" />
      <div class="h-px w-28 hidden bottom-8 right-8 absolute from-transparent to-primary/70 bg-gradient-to-r md:block" aria-hidden="true" />

      <div class="gap-10 grid w-full lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
        <div class="space-y-7">
          <div class="text-sm text-muted-foreground px-3 py-1 border rounded-full bg-background/70 inline-flex gap-2 items-center">
            <span class="i-lucide-map-pinned text-primary size-4" aria-hidden="true" />
            Route Blueprint Missing
          </div>

          <div class="space-y-4">
            <p class="text-[clamp(4rem,18vw,11rem)] text-primary/15 leading-none tracking-[-0.08em] font-black font-mono">
              404
            </p>
            <h1 class="text-3xl tracking-tight font-black max-w-2xl md:text-5xl">
              这条路由还没有接入模板主框架
            </h1>
            <p class="text-base text-muted-foreground leading-8 max-w-xl">
              当前地址不在模板路由表中。回到主框架继续搭建业务入口，或者进入示例库查看组件、布局和主题能力。
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <Button as-child class="font-bold px-5 rounded-full h-11">
              <RouterLink to="/">
                回到主框架
                <span class="i-lucide-arrow-right size-4" aria-hidden="true" />
              </RouterLink>
            </Button>
            <Button as-child variant="outline" class="font-bold px-5 rounded-full h-11">
              <RouterLink to="/">
                查看示例库
              </RouterLink>
            </Button>
            <Button type="button" variant="ghost" class="font-bold px-5 rounded-full h-11" @click="goBack">
              返回上一页
            </Button>
          </div>
        </div>

        <aside class="p-5 border rounded-[1.5rem] bg-background/80 shadow-inner">
          <p class="text-sm text-muted-foreground font-semibold">
            模板路由入口
          </p>
          <nav class="mt-4 gap-2 grid" aria-label="模板路由入口">
            <RouterLink class="p-4 border rounded-2xl transition hover:border-primary/50 hover:bg-primary/5" to="/">
              <span class="text-sm font-bold">主框架</span>
              <span class="text-xs text-muted-foreground mt-1 block">应用骨架和业务接入路径</span>
            </RouterLink>
            <RouterLink class="p-4 border rounded-2xl transition hover:border-primary/50 hover:bg-primary/5" to="/">
              <span class="text-sm font-bold">示例库</span>
              <span class="text-xs text-muted-foreground mt-1 block">组件、主题、布局和工具示例</span>
            </RouterLink>
            <RouterLink class="p-4 border rounded-2xl transition hover:border-primary/50 hover:bg-primary/5" to="/settings">
              <span class="text-sm font-bold">设置</span>
              <span class="text-xs text-muted-foreground mt-1 block">布局偏好和原生能力</span>
            </RouterLink>
          </nav>
        </aside>
      </div>
    </section>
  </main>
</template>
