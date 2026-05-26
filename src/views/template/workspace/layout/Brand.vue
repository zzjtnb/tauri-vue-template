<script setup lang="ts">
import type { Layout } from '@/components/layouts'
import { computed } from 'vue'
import { Badge } from '@/components/shadcn-vue/ui/badge'

const props = defineProps<Layout['Area']['Props']>()

const title = computed(() => props.context.route.meta.title || '智能工作台模板')
const description = computed(() => props.context.route.name === 'template-workspace'
  ? '消息流、上下文入口和模板侧栏已就绪'
  : '选择一个模板开始')
</script>

<template>
  <div aria-label="智能工作台模板标题" class="flex gap-3 min-w-0 items-center">
    <div class="text-primary border border-primary/15 rounded-2xl bg-primary/10 shrink-0 grid size-9 place-items-center max-sm:hidden">
      <span class="i-lucide-message-square-text size-4" aria-hidden="true" />
    </div>
    <div class="min-w-0">
      <div class="flex gap-2 min-w-0 items-center">
        <h2 class="text-sm tracking-[-0.02em] font-bold truncate sm:max-w-[min(32vw,24rem)]">
          {{ title }}
        </h2>
        <Badge variant="secondary" class="text-primary border border-primary/15 rounded-full bg-primary/10 inline-flex shadow-none max-sm:hidden">
          <span class="i-lucide-sparkles size-3" aria-hidden="true" />
          模板工作区
        </Badge>
      </div>
      <p class="text-xs text-muted-foreground block max-md:hidden">
        {{ description }}
      </p>
    </div>
  </div>
</template>
