<script setup lang="ts">
const buildSteps = [
  {
    title: '定义业务模块',
    description: '在 src/views/<feature>、src/stores/modules 和 src/api 中按领域新增代码。',
  },
  {
    title: '接入路由入口',
    description: '在 src/router/modules 中声明路由，顶部导航模板和示例库保持独立。',
  },
  {
    title: '替换模板 Mock',
    description: '从 mock/template 开始复制接口形状，逐步替换为真实后端。',
  },
  {
    title: '扩展桌面与文件',
    description: '需要文件、更新、窗口或系统能力时，从 settings/native 分区内按边界扩展。',
  },
] as const
</script>

<template>
  <section class="gap-4 grid lg:grid-cols-[22rem_minmax(0,1fr)]">
    <div class="p-6 border rounded-[1.5rem] bg-card">
      <p class="text-sm text-primary font-semibold">
        Build Path
      </p>
      <h2 class="text-2xl tracking-tight font-black mt-2">
        从顶部导航模板到业务的四步路径
      </h2>
      <p class="text-sm text-muted-foreground leading-6 mt-3">
        顶部导航模板只提供清晰入口和基础边界；具体业务应该作为新模块接入，而不是污染示例页。
      </p>
    </div>

    <ol class="gap-3 grid md:grid-cols-2">
      <li
        v-for="(step, index) in buildSteps"
        :key="step.title"
        class="p-5 border rounded-[1.5rem] bg-background"
      >
        <div class="text-sm text-primary-foreground font-black mb-4 rounded-full bg-primary inline-flex size-9 items-center justify-center">
          {{ index + 1 }}
        </div>
        <h3 class="font-bold">
          {{ step.title }}
        </h3>
        <p class="text-sm text-muted-foreground leading-6 mt-2">
          {{ step.description }}
        </p>
      </li>
    </ol>
  </section>
</template>
