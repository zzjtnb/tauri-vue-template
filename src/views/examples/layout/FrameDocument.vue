<script setup lang="ts">
const points = [
  '这个页面自身声明 layout=blank，因此直接打开时不渲染标准 header/sidebar/footer。',
  '被 /examples/layout/content/iframe/local 嵌入时，外层仍由标准 AppLayout 提供导航和页签。',
  '本地 Vite 模块脚本需要 sandbox 包含 allow-same-origin，否则 iframe 会变成 origin=null 并触发 CORS。',
]
</script>

<template>
  <main class="p-8 min-h-[100dvh]">
    <section class="mx-auto p-6 border border-border rounded-3xl bg-card max-w-3xl shadow-sm">
      <p class="text-sm text-primary font-medium m-0">
        Embedded frame
      </p>
      <h1 class="text-3xl tracking-[-0.035em] font-bold mb-0 mt-2">
        本地 iframe 文档
      </h1>
      <ul class="text-sm text-muted-foreground leading-7 mb-0 mt-4 pl-5">
        <li v-for="point in points" :key="point">
          {{ point }}
        </li>
      </ul>
    </section>
  </main>
</template>
