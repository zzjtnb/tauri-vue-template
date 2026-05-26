<script setup lang="ts">
import type { IconPickerValue } from './icon-picker'
import { Badge, Button, Input, Popover, PopoverContent, PopoverTrigger } from '@ui/shadcn-vue'
import { toRef } from 'vue'
import { iconPickerEmits, iconPickerProps } from './icon-picker'
import { useIconPicker } from './use-icon-picker'

defineOptions({
  name: 'IconPicker',
})

const props = defineProps(iconPickerProps)
const emit = defineEmits(iconPickerEmits)

const {
  open,
  keyword,
  loading,
  error,
  selectedName,
  selectedIconKey,
  filteredIcons,
  visibleIcons,
  svgCache,
  iconSvg,
  selectIcon,
  clearIcon,
} = useIconPicker({
  collection: toRef(props, 'collection'),
  modelValue: toRef(props, 'modelValue'),
  select: (value: IconPickerValue) => emit('update:modelValue', value),
})
</script>

<template>
  <Popover v-model:open="open">
    <div class="gap-2 grid">
      <div class="flex gap-2">
        <PopoverTrigger as-child>
          <Button type="button" variant="outline" class="px-3 flex-1 gap-3 h-10 justify-start">
            <span class="border rounded-md bg-muted/50 flex size-7 items-center justify-center">
              <span v-if="selectedName && !svgCache[selectedIconKey]" class="i-lucide-icons text-muted-foreground size-4" aria-hidden="true" />
              <span v-else-if="selectedName" class="text-primary size-4" v-html="svgCache[selectedIconKey]" />
              <span v-else class="i-lucide-icons text-muted-foreground size-4" aria-hidden="true" />
            </span>
            <span class="font-normal text-left min-w-0 truncate">
              {{ props.modelValue || `选择 ${props.collection.name} 图标` }}
            </span>
          </Button>
        </PopoverTrigger>
        <Button type="button" variant="outline" :disabled="!props.modelValue" @click="clearIcon">
          清空
        </Button>
      </div>
      <Input :model-value="props.modelValue" readonly placeholder="未选择图标" />
    </div>

    <PopoverContent class="p-0 max-w-[calc(100vw-2rem)] w-[38rem]" align="start">
      <div class="gap-0 grid md:grid-cols-[14rem_minmax(0,1fr)]">
        <section class="p-4 border-b space-y-4 md:border-b-0 md:border-r">
          <div class="space-y-1">
            <h3 class="font-semibold">
              {{ props.collection.name }} 图标
            </h3>
            <p class="text-xs text-muted-foreground">
              在线加载图标集合，点击后保存 UnoCSS 图标类。
            </p>
          </div>
          <div class="p-4 text-center border rounded-xl bg-muted/30 space-y-3">
            <div class="mx-auto border rounded-2xl bg-background flex size-16 shadow-sm items-center justify-center">
              <span v-if="selectedName && !svgCache[selectedIconKey]" class="i-lucide-icons text-muted-foreground size-8" aria-hidden="true" />
              <span v-else-if="selectedName" class="text-primary size-8" v-html="svgCache[selectedIconKey]" />
              <span v-else class="i-lucide-icons text-muted-foreground size-8" aria-hidden="true" />
            </div>
            <div>
              <p class="font-medium">
                {{ selectedName || '未选择' }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ props.modelValue || '点击右侧图标选择' }}
              </p>
            </div>
          </div>
          <div class="text-sm gap-2 grid grid-cols-2">
            <div class="p-3 border rounded-lg">
              <p class="text-xs text-muted-foreground">
                匹配
              </p>
              <p class="font-semibold">
                {{ filteredIcons.length }}
              </p>
            </div>
            <div class="p-3 border rounded-lg">
              <p class="text-xs text-muted-foreground">
                显示
              </p>
              <p class="font-semibold">
                {{ visibleIcons.length }}
              </p>
            </div>
          </div>
        </section>

        <section class="p-4 space-y-3">
          <Input v-model="keyword" :placeholder="props.placeholder" autofocus />
          <div class="flex gap-2 items-center justify-between">
            <Badge variant="outline" class="rounded-full">
              {{ filteredIcons.length }} 个匹配
            </Badge>
            <p v-if="loading" class="text-xs text-muted-foreground">
              正在在线加载图标集合...
            </p>
            <p v-else-if="error" class="text-xs text-destructive">
              {{ error }}
            </p>
            <p v-else class="text-xs text-muted-foreground">
              预览图标按需在线加载。
            </p>
          </div>
          <div class="pr-1 gap-2 grid grid-cols-8 max-h-80 overflow-y-auto">
            <button
              v-for="name in visibleIcons"
              :key="name"
              type="button"
              class="p-2 border rounded-lg bg-background flex aspect-square transition items-center justify-center hover:border-primary hover:bg-primary/5"
              :class="selectedName === name && 'border-primary bg-primary/10 text-primary'"
              :title="name"
              @click="selectIcon(name)"
            >
              <span v-if="iconSvg(name)" class="size-5" v-html="iconSvg(name)" />
              <span v-else class="i-lucide-icons text-muted-foreground size-5" aria-hidden="true" />
              <span class="sr-only">{{ name }}</span>
            </button>
          </div>
        </section>
      </div>
    </PopoverContent>
  </Popover>
</template>
