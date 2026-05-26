<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const route = useRoute()

const areas = [
  { name: 'header', source: 'workspacePreset inline', description: '示例模块内部复用预设对象，整区使用 auto/class/label，brand/right 子区分别演示完整配置对象。' },
  { name: 'sidebar', source: 'workspacePreset inline', description: '示例模块内部复用预设对象，整区和 header/content/footer 子区都使用完整配置对象。' },
  { name: 'content', source: 'toolbarPreset inline', description: '示例模块内部复用预设对象，整区使用 auto/class/label，before/after 都用显式 component 配置。' },
  { name: 'footer', source: 'toolbarPreset inline', description: '示例模块内部复用预设对象，整区使用 auto/class/label，left/center/right 都用完整配置对象和 addons。' },
  { name: 'header.center', source: 'route override', description: '当前路由继续覆盖子区，给 center 增加 label/class/addons，证明预设对象和路由可组合。' },
  { name: 'footer.right', source: 'route override', description: '当前路由覆盖底部栏右区，证明 footer 子区和 header/sidebar/content 一样走统一声明模型。' },
]

const declarationForms = [
  { title: 'auto 模式', code: 'header: \'auto\'', description: '所有整区和子区都可写 auto；有自定义来源时用自定义，没有时按该区域默认策略回退。' },
  { title: '显式组件配置', code: 'content: { component: RegionCard }', description: '组件来源统一放进 component 字段，避免直接函数和配置对象两套声明并存。' },
  { title: '完整配置对象', code: 'footer: { mode: \'auto\', label: \'演示底部栏\', left: { component: FooterStatus } }', description: '完整对象统一支持 mode/component/class/label/addons，并可继续声明子区。' },
  { title: 'all 批量子区', code: 'sidebar: { all: { component: SidebarNavigation }, header: { component: SidebarPanel } }', description: 'all 给全部子区提供默认声明，显式子区继续覆盖 all。' },
  { title: '默认设置入口', code: 'settings: false', description: '默认设置入口默认开启；示例页只演示隐藏入口，不绑定具体业务设置页。' },
  { title: '固定布局', code: 'fixed: true', description: '自定义工作台或画布需要保持当前布局壳时使用；未 fixed 的标准布局仍可跟随设置面板切换。' },
]

const regionContracts = [
  { region: 'header', parts: 'left / brand / center / right', route: 'workspacePreset + route override' },
  { region: 'sidebar', parts: 'header / content / footer', route: 'workspacePreset' },
  { region: 'content', parts: 'before / after', route: 'toolbarPreset' },
  { region: 'footer', parts: 'left / center / right', route: 'toolbarPreset + route override' },
]

const examples = [
  { to: '/layout/regions/whole-header', title: '整区 Header/Footer 组件', description: 'header/footer 通过 { component } 接管整区，sidebar 子区仍可单独覆盖。' },
  { to: '/layout/regions/components', title: '四个整区显式组件配置', description: 'header/sidebar/content/footer 全部使用 { component }，验证统一声明路径。' },
  { to: '/layout/regions/all-parts', title: 'all 批量子区', description: 'header/sidebar/content/footer 都通过 all 批量填充子区，并用显式子区覆盖局部。' },
  { to: '/layout/regions/no-settings', title: '关闭默认设置入口', description: 'layout.settings: false 关闭默认设置入口，页面仍保留其它 header 区域。' },
]

const codeSample = `layout: {
  name: 'hybrid',
  header: {
    ...workspacePreset.header,
    center: {
      mode: 'default',
      label: '路由覆盖顶部栏导航区',
      class: 'justify-center',
      addons: { before: { component: AreaAddon } },
    },
  },
  sidebar: workspacePreset.sidebar,
  content: {
    ...toolbarPreset.content,
    mode: 'auto',
    label: '区域对象演示内容',
    class: 'bg-muted/20',
  },
  footer: {
    ...toolbarPreset.footer,
    right: {
      ...toolbarPreset.footer.right,
      mode: 'auto',
      component: AreaAddon,
      label: '路由覆盖底部栏右区',
      class: 'justify-end',
    },
  },
}`
</script>

<template>
  <ShowcaseFrame
    eyebrow="Area declarations"
    title="区域对象、预设与 addons"
    description="当前页面直接通过 route.meta.layout 配置声明 name 和区域覆盖，并在示例模块内部复用 workspacePreset 与 toolbarPreset 对象；未 fixed 时设置面板可覆盖标准布局名称，但区域声明仍会保留。"
  >
    <section class="gap-3 grid lg:grid-cols-3" aria-label="区域来源列表">
      <article v-for="item in areas" :key="item.name" class="p-4 border border-border rounded-2xl bg-background">
        <p class="text-xs text-primary font-medium m-0">
          {{ item.source }}
        </p>
        <h2 class="text-base font-semibold mb-0 mt-2">
          {{ item.name }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ item.description }}
        </p>
      </article>
    </section>

    <section class="p-5 border border-border rounded-3xl bg-card" aria-label="区域声明代码说明">
      <div class="flex flex-col gap-5">
        <div>
          <h2 class="text-lg font-semibold m-0">
            真实验证路径
          </h2>
          <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3">
            当前路由：<code>{{ route.fullPath }}</code>。页面外层的顶部栏、侧边栏、内容前后区和底栏不是页面模板写出来的，而是由路由 meta 的区域声明驱动 AppLayout 渲染。
          </p>
        </div>

        <div class="gap-3 grid md:grid-cols-3" aria-label="声明形态说明">
          <article v-for="item in declarationForms" :key="item.title" class="p-4 border border-border rounded-2xl bg-background">
            <h3 class="text-sm font-semibold m-0">
              {{ item.title }}
            </h3>
            <pre class="text-xs leading-5 mb-0 mt-3 p-3 rounded-xl bg-muted overflow-auto"><code>{{ item.code }}</code></pre>
            <p class="text-xs text-muted-foreground leading-5 mb-0 mt-3">
              {{ item.description }}
            </p>
          </article>
        </div>

        <div class="gap-3 grid md:grid-cols-2 xl:grid-cols-4" aria-label="区域契约矩阵">
          <article v-for="item in regionContracts" :key="item.region" class="p-4 border border-border rounded-2xl bg-background">
            <p class="text-xs text-primary font-medium m-0">
              {{ item.region }}
            </p>
            <h3 class="text-sm font-semibold mb-0 mt-2">
              {{ item.parts }}
            </h3>
            <p class="text-xs text-muted-foreground leading-5 mb-0 mt-2">
              {{ item.route }}
            </p>
          </article>
        </div>

        <pre class="text-xs leading-6 m-0 p-4 border border-border rounded-2xl bg-background overflow-auto"><code>{{ codeSample }}</code></pre>

        <div class="gap-3 grid md:grid-cols-2" aria-label="额外真实路由示例">
          <RouterLink v-for="item in examples" :key="item.to" :to="item.to" class="p-4 border border-border rounded-2xl bg-background transition hover:bg-accent">
            <span class="text-sm text-primary font-medium inline-flex gap-2 items-center">
              {{ item.title }}
              <span class="i-lucide-arrow-right size-4" aria-hidden="true" />
            </span>
            <span class="text-xs text-muted-foreground leading-5 mt-2 block">
              {{ item.description }}
            </span>
          </RouterLink>
        </div>
      </div>
    </section>
  </ShowcaseFrame>
</template>
