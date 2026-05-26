<script setup lang="ts">
const sections = [
  { title: '没有默认 p-4/md:p-6 包裹', description: '当前组件直接进入 layout-content 命名视图，适合设置页、全屏工作台、画布类页面。' },
  { title: '仍保留外层布局能力', description: 'header、sidebar、breadcrumb、tabs、settings、footer 等能力继续由 AppLayout 管理。' },
  { title: '推荐用公共 helper', description: '路由里使用 LayoutRuntime.defineContent(component)，不要手写 layout-content 字符串。' },
]
</script>

<template>
  <div class="bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_34rem)] min-h-[calc(100dvh-8rem)]">
    <div class="mx-auto p-5 flex flex-col gap-5 max-w-7xl md:p-8">
      <section class="p-6 border border-border rounded-3xl bg-background/85 shadow-sm backdrop-blur">
        <p class="text-sm text-primary font-medium m-0">
          Content outlet takeover
        </p>
        <h1 class="text-3xl tracking-[-0.035em] font-bold mb-0 mt-2 md:text-4xl">
          整页接管内容区
        </h1>
        <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3 max-w-4xl md:text-base">
          这条路由没有走默认 RouterView 包裹，而是由 LayoutRuntime.defineContent() 同时声明 default 和 layout-content，让页面完整接管内容区域。
        </p>
      </section>

      <section class="gap-3 grid md:grid-cols-3" aria-label="内容接管验证点">
        <article v-for="item in sections" :key="item.title" class="p-5 border border-border rounded-3xl bg-background/85 shadow-sm backdrop-blur">
          <h2 class="text-lg font-semibold m-0">
            {{ item.title }}
          </h2>
          <p class="text-sm text-muted-foreground leading-6 mb-0 mt-3">
            {{ item.description }}
          </p>
        </article>
      </section>

      <section class="p-5 border border-border rounded-3xl bg-background/85 shadow-sm backdrop-blur" aria-label="内容接管使用方式">
        <pre class="text-xs leading-6 m-0 overflow-auto"><code>components: LayoutRuntime.defineContent(() =&gt; import('@/views/examples/layout/OutletControl.vue'))</code></pre>
      </section>
    </div>
  </div>
</template>
