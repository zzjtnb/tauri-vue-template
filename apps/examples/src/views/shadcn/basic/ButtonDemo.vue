<script setup lang="ts">
import { Button, Separator } from '@tauri-vue-template/ui'

const variants = [
  { variant: 'default' as const, label: '默认按钮' },
  { variant: 'secondary' as const, label: '次要按钮' },
  { variant: 'destructive' as const, label: '危险按钮' },
  { variant: 'outline' as const, label: '轮廓按钮' },
  { variant: 'ghost' as const, label: '幽灵按钮' },
  { variant: 'link' as const, label: '链接' },
]

const sizes = [
  { size: 'sm' as const, label: 'Small' },
  { size: 'default' as const, label: 'Default' },
  { size: 'lg' as const, label: 'Large' },
]

const disabledVariants = [
  { variant: 'default' as const, label: 'Disabled' },
  { variant: 'secondary' as const, label: 'Secondary Disabled' },
  { variant: 'destructive' as const, label: 'Destructive Disabled' },
  { variant: 'outline' as const, label: 'Outline Disabled' },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Button 按钮
    </h3>
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button v-for="{ variant, label } in variants" :key="variant" :variant="variant">
          {{ label }}
        </Button>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <Button v-for="{ size, label } in sizes" :key="size" :size="size">
          {{ label }}
        </Button>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button v-for="{ variant, label } in disabledVariants" :key="variant" :variant="variant" disabled>
          {{ label }}
        </Button>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了所有变体（variant）、尺寸（size）和禁用（disabled）状态
    </p>
  </div>

  <Separator />
</template>
