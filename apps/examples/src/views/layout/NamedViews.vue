<script setup lang="ts">
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const views = [
  { name: 'layout-header-left', description: '覆盖顶部栏起始区。' },
  { name: 'layout-header-brand', description: '替换默认品牌区。' },
  { name: 'layout-header-center', description: '覆盖顶部导航区。' },
  { name: 'layout-header-right', description: '覆盖顶部栏右侧操作区。' },
  { name: 'layout-sidebar-header', description: '覆盖侧边栏头部区。' },
  { name: 'layout-sidebar-content', description: '覆盖侧边栏导航内容。' },
  { name: 'layout-sidebar-footer', description: '覆盖侧边栏底部区。' },
  { name: 'layout-content-before', description: '渲染在默认内容区之前，适合工具条。' },
  { name: 'layout-content-after', description: '渲染在默认内容区之后，适合局部状态栏。' },
  { name: 'layout-footer-left', description: '覆盖底栏左区。' },
  { name: 'layout-footer-center', description: '覆盖底栏中区。' },
  { name: 'layout-footer-right', description: '覆盖底栏右区。' },
]
</script>

<template>
  <ShowcaseFrame
    eyebrow="Named views"
    title="命名视图覆盖布局区域"
    description="当前路由 components 同时声明 default 与多个 layout-* 命名视图。AreaOutlet 会按优先级选择：显式 slot > 路由命名视图 > route.meta.layout 组件 > 默认内容。"
  >
    <section class="gap-3 grid md:grid-cols-2 xl:grid-cols-3" aria-label="命名视图列表">
      <article v-for="item in views" :key="item.name" class="p-4 border border-border rounded-2xl bg-background">
        <h2 class="text-sm font-semibold m-0">
          {{ item.name }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ item.description }}
        </p>
      </article>
    </section>

    <section class="p-5 border border-border rounded-3xl bg-card" aria-label="命名视图验证说明">
      <h2 class="text-lg font-semibold m-0">
        看页面周边区域
      </h2>
      <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3">
        顶部栏品牌 / 导航 / 操作区、侧边栏头部 / 内容 / 底部区、内容前后置区和底栏 left / center / right 都由 Vue Router 的命名视图注入；它们不是当前 default 页面模板的一部分。
      </p>
    </section>
  </ShowcaseFrame>
</template>
