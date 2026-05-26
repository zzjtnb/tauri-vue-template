<script setup lang="ts">
import { Button } from '@tauri-vue-template/ui'

const emit = defineEmits<{
  start: [command: string]
}>()

const starters = [
  {
    command: '梳理一个新功能从想法到上线的执行路径',
    description: '把目标、角色、页面、接口和验收点拆成可执行清单。',
    icon: 'i-lucide-list-checks',
  },
  {
    command: '规划一个带侧栏和顶部操作区的业务工作台',
    description: '生成适合后台、AI 助手或工单系统的页面骨架。',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    command: '整理一次接口联调前需要确认的事项',
    description: '覆盖环境、权限、参数、错误码和回归路径。',
    icon: 'i-lucide-plug-zap',
  },
] as const
</script>

<template>
  <section class="mx-auto px-4 py-8 flex flex-col max-w-5xl min-h-full w-full justify-center overflow-x-hidden md:px-6">
    <div class="mx-auto text-center flex flex-col max-w-3xl w-full items-center">
      <div class="mb-5 relative">
        <div aria-hidden="true" class="rounded-full bg-primary/20 inset-0 absolute blur-2xl" />
        <div class="text-primary border border-primary/15 rounded-[1.6rem] bg-card/80 grid size-16 shadow-sm place-items-center relative backdrop-blur">
          <span class="i-lucide-bot size-7" aria-hidden="true" />
        </div>
      </div>

      <p class="text-xs text-primary tracking-[0.18em] font-bold uppercase">
        Workspace Template
      </p>
      <h1 class="text-4xl leading-tight tracking-[-0.06em] font-black mt-3 md:text-5xl">
        智能工作台模板
      </h1>
      <p class="text-sm text-muted-foreground leading-7 mt-4 max-w-2xl md:text-base">
        将工作区导航、活动记录和底部命令栏组合在同一个自定义布局里，适合承载任务推进、上下文整理和操作执行。
      </p>
    </div>

    <div class="mt-8 gap-3 grid min-w-0 w-full md:grid-cols-3">
      <Button
        v-for="starter in starters"
        :key="starter.command"
        type="button"
        variant="outline"
        class="group p-4 text-left border-border/80 rounded-3xl bg-card/70 flex-col h-full max-w-full min-h-32 min-w-0 w-full whitespace-normal shadow-sm transition-all items-start justify-between overflow-hidden backdrop-blur hover:border-primary/30 hover:bg-card hover:shadow-md hover:-translate-y-0.5"
        @click="emit('start', starter.command)"
      >
        <span class="text-primary p-2 rounded-2xl bg-primary/10 transition-colors group-hover:text-primary-foreground group-hover:bg-primary">
          <span class="size-4" :class="starter.icon" aria-hidden="true" />
        </span>
        <span class="mt-4 gap-1 grid min-w-0 w-full whitespace-normal">
          <span class="text-sm text-foreground leading-5 font-semibold max-w-full block whitespace-normal break-words">{{ starter.command }}</span>
          <span class="text-xs text-muted-foreground leading-5 max-w-full block whitespace-normal break-words">{{ starter.description }}</span>
        </span>
      </Button>
    </div>
  </section>
</template>
