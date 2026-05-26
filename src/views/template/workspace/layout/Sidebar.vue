<script setup lang="ts">
import type { Layout } from '@/components/layouts'
import { computed } from 'vue'
import { Button } from '@/components/shadcn-vue/ui/button'
import WorkspaceActions from './Actions.vue'

const props = defineProps<Layout['Area']['Props']>()

const sidebarPart = computed(() => {
  const part = props.context.area?.part
  return part === 'header' || part === 'footer' ? part : 'content'
})
const collapsed = computed(() => props.context.sidebar.collapsed)
const mobile = computed(() => props.context.viewport.mobile)

const workspaceEntries = [
  {
    title: '工作台总览',
    description: '当前目标、进度和待办概览',
    icon: 'i-lucide-layout-dashboard',
    status: '当前',
  },
  {
    title: '任务队列',
    description: '待处理工作项和执行顺序',
    icon: 'i-lucide-list-checks',
    status: '4 项',
  },
  {
    title: '活动记录',
    description: '系统反馈、操作历史和结果',
    icon: 'i-lucide-history',
    status: '同步',
  },
  {
    title: '知识上下文',
    description: '资料、约束、接口和验收点',
    icon: 'i-lucide-brain-circuit',
    status: '整理',
  },
] as const

const workStages = [
  {
    title: '需求梳理',
    description: '目标、角色和边界确认',
    icon: 'i-lucide-clipboard-list',
    status: '准备中',
  },
  {
    title: '信息架构',
    description: '菜单、路径和页面分区归类',
    icon: 'i-lucide-network',
    status: '已规划',
  },
  {
    title: '界面组织',
    description: '顶部栏、侧栏和内容区拆分',
    icon: 'i-lucide-layout-dashboard',
    status: '进行中',
  },
  {
    title: '活动流设计',
    description: '工作项、系统反馈和历史记录',
    icon: 'i-lucide-list-tree',
    status: '进行中',
  },
  {
    title: '命令栏设计',
    description: '输入、工具、执行和状态提示',
    icon: 'i-lucide-terminal-square',
    status: '已接入',
  },
  {
    title: '授权流程',
    description: '登录、注册、登出和继续执行',
    icon: 'i-lucide-shield-check',
    status: '已接入',
  },
  {
    title: '能力接入',
    description: '命令、活动流和外部服务',
    icon: 'i-lucide-plug-zap',
    status: '待接入',
  },
  {
    title: '验收闭环',
    description: '类型检查、交互验证和视觉复查',
    icon: 'i-lucide-badge-check',
    status: '待验证',
  },
] as const

const resources = [
  {
    label: '布局配置',
    value: 'hybrid',
  },
  {
    label: '内容模式',
    value: 'activity',
  },
  {
    label: '操作入口',
    value: 'dropdown',
  },
  {
    label: '授权接口',
    value: '/auth',
  },
  {
    label: '输入模式',
    value: 'command',
  },
  {
    label: '侧栏内容',
    value: 'scroll',
  },
] as const

const shortcuts = [
  '创建一个工作项',
  '检查当前布局边界',
  '生成接口联调清单',
  '整理验收步骤',
  '输出页面改版建议',
] as const

function closeMobileSidebar(): void {
  if (mobile.value) {
    props.context.sidebar.close()
  }
}
</script>

<template>
  <div v-if="sidebarPart === 'header'" aria-label="智能工作台模板侧边栏顶部" class="p-3 flex flex-col gap-2 min-w-0 w-full">
    <div class="flex gap-2 min-w-0 w-full items-center" :class="collapsed ? 'justify-center' : 'justify-between'">
      <span class="flex gap-2 min-w-0 items-center">
        <span class="text-sidebar-primary border border-sidebar-border rounded-xl bg-background/80 shrink-0 grid size-8 place-items-center">
          <span class="i-lucide-bot size-4" aria-hidden="true" />
        </span>
        <span :class="collapsed ? 'sr-only' : 'min-w-0'">
          <span class="text-sm font-semibold block truncate">工作台模板</span>
          <span class="text-xs text-sidebar-foreground/60 block truncate">自定义布局示例</span>
        </span>
      </span>
      <Button v-if="mobile" type="button" variant="ghost" size="icon" class="text-sidebar-foreground/70 rounded-lg shrink-0 hover:text-sidebar-foreground hover:bg-sidebar-accent" aria-label="关闭侧边栏" @click="closeMobileSidebar">
        <span class="i-lucide-x size-4" aria-hidden="true" />
      </Button>
    </div>

    <Button
      type="button"
      class="text-sidebar-primary-foreground rounded-2xl bg-sidebar-primary h-10 shadow-sm transition hover:bg-sidebar-primary/90"
      :class="collapsed ? 'px-2 justify-center' : 'px-3 justify-start'"
      :title="collapsed ? '新建工作项' : undefined"
      :aria-label="collapsed ? '新建工作项' : undefined"
    >
      <span class="i-lucide-file-plus-2 size-4" aria-hidden="true" />
      <span :class="collapsed ? 'sr-only' : ''">新建工作项</span>
    </Button>
  </div>

  <div v-else-if="sidebarPart === 'content'" aria-label="智能工作台模板侧边栏主体" class="p-3 pr-5 flex flex-col gap-4 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">
    <section aria-label="工作区入口" class="gap-2 grid min-w-0 w-full overflow-hidden">
      <div :class="collapsed ? 'sr-only' : 'px-1 flex items-center justify-between'">
        <h3 class="text-xs text-sidebar-foreground/55 tracking-widest font-bold uppercase">
          Workspace
        </h3>
        <span class="text-[0.68rem] text-sidebar-foreground/50">Live</span>
      </div>
      <button
        v-for="entry in workspaceEntries"
        :key="entry.title"
        type="button"
        class="px-3 py-2.5 text-left border border-transparent rounded-2xl flex gap-3 min-h-14 min-w-0 w-full transition items-center overflow-hidden hover:border-sidebar-border hover:bg-background/70"
        :class="entry.status === '当前' ? 'bg-background/85 text-sidebar-foreground shadow-sm' : 'text-sidebar-foreground/75 hover:text-sidebar-foreground'"
        :title="collapsed ? entry.title : undefined"
        :aria-label="collapsed ? entry.title : undefined"
      >
        <span class="text-sidebar-primary shrink-0 size-4" :class="entry.icon" aria-hidden="true" />
        <span :class="collapsed ? 'sr-only' : 'min-w-0 flex-1'">
          <span class="text-sm font-medium block truncate">{{ entry.title }}</span>
          <span class="text-xs text-sidebar-foreground/55 leading-5 block truncate">{{ entry.description }}</span>
        </span>
        <span v-if="!collapsed" class="text-[0.68rem] text-sidebar-foreground/60 px-2 py-0.5 border border-sidebar-border rounded-full bg-background/60 shrink-0 max-w-16 truncate">
          {{ entry.status }}
        </span>
      </button>
    </section>

    <section :class="collapsed ? 'sr-only' : 'grid gap-2 min-w-0 w-full overflow-hidden'" aria-label="工作台阶段">
      <div class="px-1 flex items-center justify-between">
        <h3 class="text-xs text-sidebar-foreground/55 tracking-widest font-bold uppercase">
          Workflow
        </h3>
        <span class="text-[0.68rem] text-sidebar-foreground/50">{{ workStages.length }} steps</span>
      </div>
      <article
        v-for="stage in workStages"
        :key="stage.title"
        class="p-3 border border-sidebar-border rounded-2xl bg-sidebar-accent/35 gap-2 grid min-w-0 w-full overflow-hidden"
      >
        <div class="flex gap-2 min-w-0 items-start justify-between">
          <span class="flex flex-1 gap-2 min-w-0 items-center overflow-hidden">
            <span class="text-sidebar-primary shrink-0 size-4" :class="stage.icon" aria-hidden="true" />
            <span class="text-sm font-medium min-w-0 truncate">{{ stage.title }}</span>
          </span>
          <span class="text-[0.68rem] text-sidebar-foreground/60 px-2 py-0.5 border border-sidebar-border rounded-full bg-background/60 shrink-0 max-w-20 truncate">
            {{ stage.status }}
          </span>
        </div>
        <p class="text-xs text-sidebar-foreground/55 leading-5 m-0">
          {{ stage.description }}
        </p>
      </article>
    </section>

    <section :class="collapsed ? 'sr-only' : 'p-3 border border-sidebar-border rounded-2xl bg-background/55 grid gap-2 min-w-0 w-full overflow-hidden'" aria-label="模板资源">
      <h3 class="text-xs text-sidebar-foreground/55 tracking-widest font-bold uppercase">
        Template Meta
      </h3>
      <dl class="gap-2 grid">
        <div v-for="resource in resources" :key="resource.label" class="flex gap-3 min-w-0 items-center justify-between">
          <dt class="text-xs text-sidebar-foreground/55 min-w-0 truncate">
            {{ resource.label }}
          </dt>
          <dd class="text-xs text-sidebar-foreground font-medium shrink-0 max-w-[55%] truncate">
            {{ resource.value }}
          </dd>
        </div>
      </dl>
    </section>

    <section :class="collapsed ? 'sr-only' : 'p-3 border border-sidebar-border rounded-2xl bg-sidebar-accent/35 grid gap-2 min-w-0 w-full overflow-hidden'" aria-label="快捷命令">
      <h3 class="text-xs text-sidebar-foreground/55 tracking-widest font-bold uppercase">
        Shortcuts
      </h3>
      <div class="gap-1.5 grid">
        <button
          v-for="shortcut in shortcuts"
          :key="shortcut"
          type="button"
          class="text-xs text-sidebar-foreground/70 px-3 py-2 text-left rounded-xl bg-background/45 min-w-0 w-full truncate transition hover:text-sidebar-foreground hover:bg-background/80"
        >
          {{ shortcut }}
        </button>
      </div>
    </section>
  </div>

  <div v-else aria-label="智能工作台模板侧边栏底部" class="p-3 grid min-w-0 w-full">
    <WorkspaceActions :context="props.context" />
  </div>
</template>
