<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { computed, ref } from 'vue'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Input } from '@/components/shadcn-vue/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-vue/ui/popover'
import { Slider } from '@/components/shadcn-vue/ui/slider'

interface Props {
  modelValue: string
  placeholder?: string
  autoClose?: boolean // 选择颜色后自动关闭
}

const props = withDefaults(defineProps<Props>(), { placeholder: '#000000', autoClose: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const colorValue = useVModel(props, 'modelValue', emit)
const isOpen = ref(false)

// 预设颜色
const PRESET_COLORS = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#000000', '#808080', '#FFFFFF'] as const

// 颜色处理
function parseColor(color: string) {
  if (color === 'transparent')
    return { hex: '#000000', alpha: 0 }

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)

  const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1).data

  return {
    hex: `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`,
    alpha: a / 255,
  }
}

function formatColor(hex: string, alpha: number) {
  if (alpha === 0)
    return 'transparent'
  if (alpha === 1)
    return hex

  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

// 计算属性
const currentColor = computed(() => parseColor(colorValue.value))
const displayColor = computed(() => colorValue.value === 'transparent' ? '#ffffff' : colorValue.value)
const isTransparent = computed(() => colorValue.value === 'transparent')

const transparentPreviewStyle = {
  background: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 6px 6px',
}
const transparentButtonStyle = {
  background: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 4px 4px',
}

const baseColor = computed({
  get: () => currentColor.value.hex,
  set: (hex: string) => colorValue.value = formatColor(hex, currentColor.value.alpha),
})

const alphaValue = computed({
  get: () => currentColor.value.alpha,
  set: (alpha: number) => colorValue.value = formatColor(currentColor.value.hex, alpha),
})

// 函数
const handleAutoClose = () => props.autoClose && (isOpen.value = false)
const closePopover = () => isOpen.value = false
function setPresetColor(color: string) {
  colorValue.value = color
  handleAutoClose()
}
function setTransparent() {
  colorValue.value = 'transparent'
  handleAutoClose()
}
</script>

<template>
  <div class="flex gap-2">
    <!-- 颜色预览触发器 -->
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <button
          class="group border-2 border-border rounded-lg h-10 w-16 transition-all relative overflow-hidden hover:border-primary hover:shadow-md"
          :style="{ backgroundColor: displayColor }"
        >
          <!-- 透明色棋盘背景 -->
          <div
            v-if="isTransparent"
            class="inset-0 absolute"
            :style="transparentPreviewStyle"
          />
          <!-- 悬浮效果 -->
          <div class="bg-black/0 transition-colors inset-0 absolute group-hover:bg-black/10" />
        </button>
      </PopoverTrigger>

      <PopoverContent class="p-6 w-80 space-y-6" side="bottom" align="start">
        <!-- 简洁标题 -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            选择颜色
          </h3>
          <Button
            variant="ghost"
            size="sm"
            class="p-0 h-9 w-9"
            @click="closePopover"
          >
            <div class="i-ri-close-line h-4 w-4" />
          </Button>
        </div>

        <!-- 基础颜色 -->
        <div class="space-y-2">
          <label class="text-sm font-medium">基础颜色</label>
          <Input
            v-model="baseColor"
            type="color"
            class="h-12 w-full cursor-pointer"
          />
        </div>

        <!-- 透明度 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">透明度</label>
            <span class="text-sm text-muted-foreground">{{ Math.round(alphaValue * 100) }}%</span>
          </div>
          <Slider
            :model-value="[alphaValue]"
            :min="0"
            :max="1"
            :step="0.01"
            @update:model-value="(value?: number[]) => alphaValue = value?.[0] ?? 0"
          />
        </div>

        <!-- 预设颜色 -->
        <div class="space-y-2">
          <label class="text-sm font-medium">预设颜色</label>

          <!-- 颜色网格 -->
          <div class="gap-3 grid grid-cols-5">
            <Button
              v-for="color in PRESET_COLORS"
              :key="color"
              variant="outline"
              size="icon"
              class="p-0 border-2 h-10 w-10 transition-all relative hover:scale-105"
              :class="{
                'border-primary ring-2 ring-primary/20': baseColor === color,
                'border-border hover:border-primary/60': baseColor !== color,
              }"
              :style="{ backgroundColor: color }"
              @click="setPresetColor(color)"
            >
              <!-- 选中指示器 -->
              <div
                v-if="baseColor === color"
                class="flex items-center inset-0 justify-center absolute"
              >
                <div class="i-ri-check-line text-white h-4 w-4 drop-shadow-lg" />
              </div>
            </Button>

            <!-- 透明色按钮 -->
            <Button
              variant="outline"
              size="icon"
              class="p-0 border-2 h-10 w-10 transition-all relative hover:scale-105"
              :class="{
                'border-primary ring-2 ring-primary/20': isTransparent,
                'border-border hover:border-primary/60': !isTransparent,
              }"
              :style="transparentButtonStyle"
              @click="setTransparent"
            >
              <!-- 选中指示器 -->
              <div
                v-if="isTransparent"
                class="flex items-center inset-0 justify-center absolute"
              >
                <div class="i-ri-check-line text-muted-foreground h-4 w-4 drop-shadow-lg" />
              </div>
            </Button>
          </div>

          <!-- 颜色值 -->
          <div class="space-y-2">
            <label class="text-sm font-medium">颜色值</label>
            <Input
              v-model="colorValue"
              type="text"
              :placeholder="placeholder"
              class="font-mono"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- 文本输入框 -->
    <Input
      v-model="colorValue"
      type="text"
      :placeholder="placeholder"
      class="font-mono flex-1"
    />
  </div>
</template>
