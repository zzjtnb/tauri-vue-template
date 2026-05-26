<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/shadcn-vue/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-vue/ui/radio-group'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const radioValue = ref('option1')
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Radio Group 单选框
    </h3>
    <div class="flex flex-col gap-4">
      <div>
        <RadioGroup v-model="radioValue">
          <div class="flex gap-2 items-center">
            <RadioGroupItem id="option1" value="option1" />
            <Label for="option1">
              选项 1（默认选中）
            </Label>
          </div>
          <div class="flex gap-2 items-center">
            <RadioGroupItem id="option2" value="option2" />
            <Label for="option2">
              选项 2
            </Label>
          </div>
          <div class="flex gap-2 items-center">
            <RadioGroupItem id="option3" value="option3" />
            <Label for="option3">
              选项 3
            </Label>
          </div>
        </RadioGroup>
        <p class="text-sm text-muted-foreground mt-2">
          当前选择: {{ radioValue }}
        </p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">
          禁用状态
        </p>
        <RadioGroup>
          <div class="flex gap-2 items-center">
            <RadioGroupItem id="disabled1" value="disabled1" disabled />
            <Label for="disabled1">
              禁用选项（未选中）
            </Label>
          </div>
          <div class="flex gap-2 items-center">
            <RadioGroupItem id="disabled2" value="disabled2" disabled checked />
            <Label for="disabled2">
              禁用选项（已选中）
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了单选框的选中和禁用状态
    </p>
  </div>

  <Separator />
</template>
