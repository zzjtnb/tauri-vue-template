<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@/components/shadcn-vue/ui/checkbox'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const checkedValue = ref<boolean | 'indeterminate'>(true) // 默认选中，展示选中状态
const indeterminateValue = ref<boolean | 'indeterminate'>('indeterminate')
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Checkbox 复选框
    </h3>
    <div class="flex flex-col gap-3">
      <div class="flex gap-2 items-center">
        <Checkbox id="checkbox-1" :model-value="checkedValue" @update:model-value="(val: boolean | 'indeterminate') => checkedValue = val" />
        <Label for="checkbox-1">
          接受条款和条件 ({{ checkedValue === true ? '已选中 ✓' : checkedValue === 'indeterminate' ? '半选' : '未选中' }})
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Checkbox id="checkbox-1b" />
        <Label for="checkbox-1b">
          未选中状态示例
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Checkbox id="checkbox-2" :model-value="indeterminateValue" />
        <Label for="checkbox-2">
          半选状态（Indeterminate）
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Checkbox id="checkbox-3" :model-value="false" disabled />
        <Label for="checkbox-3">
          禁用状态（未选中）
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Checkbox id="checkbox-4" :model-value="true" disabled />
        <Label for="checkbox-4">
          禁用状态（已选中）
        </Label>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了选中、未选中、半选（indeterminate）和禁用状态
    </p>
  </div>

  <Separator />
</template>
