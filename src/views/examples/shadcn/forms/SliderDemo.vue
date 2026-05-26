<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import { Slider } from '@/components/shadcn-vue/ui/slider'

const sliderValue = ref([50])
const rangeValue = ref([25, 75])
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Slider 滑块
    </h3>
    <div class="flex flex-col gap-6">
      <!-- 基础滑块 -->
      <div class="flex flex-col gap-2">
        <Label>基础滑块（默认值 50）</Label>
        <Slider v-model="sliderValue" :max="100" :step="1" />
        <p class="text-sm text-muted-foreground">
          当前值：{{ sliderValue[0] }}
        </p>
      </div>

      <!-- 范围滑块 -->
      <div class="flex flex-col gap-2">
        <Label>范围滑块（双滑块）</Label>
        <Slider v-model="rangeValue" :max="100" :step="1" />
        <p class="text-sm text-muted-foreground">
          范围：{{ rangeValue[0] }} - {{ rangeValue[1] }}
        </p>
      </div>

      <!-- 禁用状态 -->
      <div class="flex flex-col gap-2">
        <Label>禁用状态</Label>
        <Slider :model-value="[30]" :max="100" disabled />
      </div>

      <!-- 自定义步长 -->
      <div class="flex flex-col gap-2">
        <Label>自定义步长（step="10"）</Label>
        <Slider :model-value="[50]" :max="100" :step="10" />
      </div>
    </div>
  </div>

  <Separator />
</template>
