<script setup lang="ts">
import { Badge } from '@/components/shadcn-vue/ui/badge'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const variants = [
  { variant: 'default' as const, label: '默认' },
  { variant: 'secondary' as const, label: '次要' },
  { variant: 'destructive' as const, label: '危险' },
  { variant: 'outline' as const, label: '轮廓' },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Badge 徽章
    </h3>
    <div class="flex flex-wrap gap-2 items-center">
      <Badge v-for="{ variant, label } in variants" :key="variant" :variant="variant">
        {{ label }}
      </Badge>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了所有徽章变体
    </p>
  </div>

  <Separator />
</template>
