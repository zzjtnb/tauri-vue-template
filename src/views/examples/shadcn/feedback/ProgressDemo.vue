<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Progress } from '@/components/shadcn-vue/ui/progress'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const progress = ref(0)
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    progress.value = (progress.value + 1) % 101
  }, 100)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Progress 进度条
    </h3>
    <div class="flex flex-col gap-6">
      <!-- 动态进度 -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium">
          动态进度（自动循环）
        </p>
        <Progress :model-value="progress" />
        <p class="text-sm text-muted-foreground">
          当前进度：{{ progress }}%
        </p>
      </div>

      <!-- 固定进度 -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium">
          固定进度
        </p>
        <div v-for="value in [25, 50, 75, 100]" :key="value" class="flex flex-col gap-2">
          <Progress :model-value="value" />
          <p class="text-sm text-muted-foreground">
            {{ value }}%{{ value === 100 ? '（完成状态）' : '' }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <Separator />
</template>
