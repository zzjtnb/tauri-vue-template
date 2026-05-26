<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ShowcaseFrame from './components/ShowcaseFrame.vue'

const groups = [
  {
    title: '布局名称',
    icon: 'i-lucide-panels-top-left',
    items: ['topnav', 'sidebar', 'hybrid', 'blank', '用户偏好只覆盖未声明 layout 的普通页面'],
  },
  {
    title: '区域来源',
    icon: 'i-lucide-layers-3',
    items: ['route.meta.layout 对象', 'context.areas 预设', '命名视图覆盖', '显式 slots 最高优先级', 'addons 前后附加内容'],
  },
  {
    title: '内容出口',
    icon: 'i-lucide-square-dashed-mouse-pointer',
    items: ['默认 RouterView', 'LayoutRuntime.defineContent', 'content.before / content.after', 'iframeSrc 安全参数', 'KeepAlive 与 cacheKey'],
  },
  {
    title: '导航元素',
    icon: 'i-lucide-route',
    items: ['菜单树', '外链菜单', 'breadcrumb', '固定页签契约', 'visited tabs 操作'],
  },
]

const entries = [
  { to: '/layout/standard/topnav', title: '标准布局模式', description: '分别进入 topnav、sidebar、hybrid、blank，验证布局名、面包屑、页签和 footer。', icon: 'i-lucide-panel-top' },
  { to: '/layout/regions/areas', title: '区域对象与预设', description: '演示 route.meta.layout 配置、context.areas、all 批量子区和 addons。', icon: 'i-lucide-panels-top-left' },
  { to: '/layout/regions/named-views', title: '命名视图覆盖', description: '用 header、sidebar、content、footer 的 layout-* 命名视图覆盖具体区域。', icon: 'i-lucide-route' },
  { to: '/layout/content/outlet', title: '整页接管内容区', description: '使用 LayoutRuntime.defineContent 接管 layout-content，避开默认内容包裹。', icon: 'i-lucide-square-dashed-mouse-pointer' },
  { to: '/layout/content/iframe', title: 'iframe 内容出口', description: '展示本地和外部 iframeSrc、sandbox、referrerPolicy、allow 的真实渲染路径。', icon: 'i-lucide-panels-right-bottom' },
  { to: '/layout/state/cache/alpha', title: '页签与 KeepAlive', description: '验证 keepAlive、cacheKey、visited tabs 和关闭操作；示例路由不占用业务固定页签。', icon: 'i-lucide-history' },
  { to: '/layout/regions/slots', title: '显式 Slots 宿主', description: '嵌入 AppLayout，用 slots 覆盖 header/sidebar/content/footer，证明 slot 优先级最高。', icon: 'i-lucide-layout-template' },
]
</script>

<template>
  <ShowcaseFrame
    eyebrow="Layout showcase"
    title="布局系统完整演示"
    description="这个演示模块覆盖布局库的公开能力：标准布局名、区域对象、区域预设、命名视图、显式 slots、内容出口、iframe、页签缓存、设置面板、侧边栏状态和菜单元信息。"
  >
    <section class="gap-3 grid md:grid-cols-2 xl:grid-cols-4" aria-label="能力矩阵">
      <article v-for="group in groups" :key="group.title" class="p-4 border border-border rounded-2xl bg-background shadow-sm">
        <span class="text-primary mb-3 p-2 rounded-xl bg-primary/10 inline-flex" :class="group.icon" aria-hidden="true" />
        <h2 class="text-base font-semibold m-0">
          {{ group.title }}
        </h2>
        <ul class="text-sm text-muted-foreground leading-6 mb-0 mt-3 pl-4">
          <li v-for="item in group.items" :key="item">
            {{ item }}
          </li>
        </ul>
      </article>
    </section>

    <section class="gap-3 grid lg:grid-cols-2" aria-label="演示入口">
      <RouterLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="p-5 text-left border border-border rounded-3xl bg-card shadow-sm transition hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
      >
        <span class="text-primary mb-4 p-3 rounded-2xl bg-primary/10 inline-flex" :class="entry.icon" aria-hidden="true" />
        <h2 class="text-lg font-semibold m-0">
          {{ entry.title }}
        </h2>
        <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
          {{ entry.description }}
        </p>
      </RouterLink>
    </section>
  </ShowcaseFrame>
</template>
