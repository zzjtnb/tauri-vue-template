<script setup lang="ts">
import { ref } from 'vue'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import { Toggle } from '@/components/shadcn-vue/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn-vue/ui/toggle-group'

const toggleValue = ref(true) // 默认选中，展示激活状态
const toggleGroupValue = ref('center') // 默认选中居中，展示激活状态

const toggleButtons = [
  { icon: 'i-ri-bold', label: '粗体', pressed: true, ariaLabel: '切换粗体' },
  { icon: 'i-ri-italic', label: '斜体', pressed: false, ariaLabel: '切换斜体' },
  { icon: 'i-ri-underline', label: '下划线', pressed: false, ariaLabel: '切换下划线' },
]

const alignments = [
  { value: 'left', icon: 'i-ri-align-left', ariaLabel: '左对齐' },
  { value: 'center', icon: 'i-ri-align-center', ariaLabel: '居中对齐' },
  { value: 'right', icon: 'i-ri-align-right', ariaLabel: '右对齐' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Toggle 切换按钮 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Toggle 切换按钮
      </h3>
      <div class="flex gap-2">
        <Toggle
          v-for="(button, index) in toggleButtons"
          :key="button.label"
          :pressed="index === 0 ? toggleValue : button.pressed"
          :aria-label="button.ariaLabel"
          @update:pressed="index === 0 && (toggleValue = $event)"
        >
          <span :class="button.icon" data-icon="inline-start" aria-hidden="true" />
          {{ button.label }}
        </Toggle>
      </div>
      <p class="text-sm text-muted-foreground">
        粗体状态: {{ toggleValue ? '开启（激活样式）' : '关闭' }} - 点击切换查看不同状态
      </p>
    </div>

    <Separator />

    <!-- Toggle Group 切换按钮组 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Toggle Group 切换按钮组
      </h3>
      <ToggleGroup v-model="toggleGroupValue" type="single">
        <ToggleGroupItem v-for="align in alignments" :key="align.value" :value="align.value" :aria-label="align.ariaLabel">
          <span :class="align.icon" />
        </ToggleGroupItem>
      </ToggleGroup>
      <p class="text-sm text-muted-foreground">
        当前对齐: {{ toggleGroupValue }}（激活的按钮会高亮显示）
      </p>
    </div>
  </div>

  <Separator />
</template>
