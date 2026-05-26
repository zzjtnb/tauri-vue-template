<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import { Switch } from '@/components/shadcn-vue/ui/switch'

const switchValue = ref(true) // 默认开启，展示开启状态
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Switch 开关
    </h3>
    <div class="flex flex-col gap-3">
      <div class="flex gap-2 items-center">
        <Switch id="switch-1" :model-value="switchValue" @update:model-value="switchValue = $event" />
        <Label for="switch-1">
          启用通知 ({{ switchValue ? '开启 ✓' : '关闭' }})
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Switch id="switch-1b" :model-value="false" />
        <Label for="switch-1b">
          关闭状态示例
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Switch id="switch-2" :model-value="false" disabled />
        <Label for="switch-2">
          禁用状态（关闭）
        </Label>
      </div>
      <div class="flex gap-2 items-center">
        <Switch id="switch-3" :model-value="true" disabled />
        <Label for="switch-3">
          禁用状态（开启）
        </Label>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了开关的开启、关闭和禁用状态（点击可切换）
    </p>
  </div>

  <Separator />
</template>
