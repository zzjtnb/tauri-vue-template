<script setup lang="ts">
import type { LogoColorKey, LogoConfig, LogoEffect, LogoWidthKey, OutlineConfig } from './types'
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch, watchEffect } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-vue/ui/card'
import { Checkbox } from '@/components/shadcn-vue/ui/checkbox'
import { Input } from '@/components/shadcn-vue/ui/input'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-vue/ui/select'
import { Slider } from '@/components/shadcn-vue/ui/slider'
import { Switch } from '@/components/shadcn-vue/ui/switch'
import ColorPicker from './ColorPicker.vue'
import { DEFAULT_THEME_KEY, DEFAULT_VARIANT_ID, defaultLogoConfig, LOGO_EFFECT_OPTIONS, LOGO_PANELS } from './config'
import { convertTextToPath, defaultOutlineConfig, downloadIco, downloadIcoBatch, downloadPng, downloadPngBatch, downloadSvg, EXPORT_SIZE_OPTIONS, FAVICON_ICO_SIZES, NO_FONT_ACTION_OPTIONS } from './export'
import { getFontWeightRange, isVariableFont, LOGO_FONTS } from './fonts'
import { calculateFinalScale, generateSvg } from './logo'
import { LOGO_THEMES } from './themes'

const config = ref<LogoConfig>({ ...defaultLogoConfig })
const outlineConfig = ref<OutlineConfig>({ ...defaultOutlineConfig })
const selectedTheme = ref(DEFAULT_THEME_KEY)
const selectedVariant = ref(DEFAULT_VARIANT_ID)
// 保存非透明时的背景色，初始化为默认主题的背景色
const defaultVariantConfig = LOGO_THEMES[DEFAULT_THEME_KEY]?.variants.find(variant => variant.id === DEFAULT_VARIANT_ID)?.config
const savedBackgroundFill = ref(defaultVariantConfig?.backgroundFill || '#E8F2FF')
const exportFormat = ref<'png' | 'ico'>('png') // 导出格式
const exportSize = ref(512) // 默认导出尺寸
const useCurrentColor = ref(false) // 是否使用 currentColor（可通过 CSS 控制颜色）
const showOutlineOptions = ref(false) // 是否显示高级转曲选项
const enableAnimation = ref(true) // 是否开启动画（仅虚圈有效）
const { copy } = useClipboard()

// 根据导出格式动态获取尺寸选项
const currentSizeOptions = computed(() => {
  return exportFormat.value === 'png' ? EXPORT_SIZE_OPTIONS : FAVICON_ICO_SIZES
})

// 切换格式时重置尺寸为该格式的默认值
watch(exportFormat, (format) => {
  exportSize.value = format === 'png' ? 512 : 32
})

// 画布尺寸(正方形)
const canvasSize = computed({
  get: () => config.value.width,
  set: (val) => {
    config.value.width = val
    config.value.height = val
  },
})

// Slider 绑定工厂函数
function createSliderBinding(key: keyof LogoConfig) {
  return computed({
    get: () => [config.value[key] as unknown as number],
    set: (val: number[] | undefined) => {
      if (val?.length)
        config.value[key] = val[0] as never
    },
  })
}

const fontSizeValue = createSliderBinding('fontSize')

// 圆角比例 Slider 绑定（百分比 0-50 <-> 小数 0-0.5）
const backgroundRxControl = computed({
  get: () => Math.round(config.value.backgroundRx * 100),
  set: (val: number | undefined) => {
    if (typeof val === 'number')
      config.value.backgroundRx = val / 100
  },
})
const backgroundRxSliderBinding = computed({
  get: () => [backgroundRxControl.value],
  set: (val: number[] | undefined) => {
    if (val?.[0] !== undefined)
      backgroundRxControl.value = val[0]
  },
})

// ==================== 字体选择逻辑 ====================

// 当前选中的字体 family
const selectedFontFamily = computed({
  get: () => config.value.fontFamily,
  set: (family: string) => {
    const fontConfig = LOGO_FONTS[family]
    if (fontConfig) {
      config.value.fontFamily = family
      config.value.fontWeight = fontConfig.defaultWeight
    }
  },
})

// 当前字体配置
const currentFontConfig = computed(() => LOGO_FONTS[selectedFontFamily.value])

// 是否为可变字体
const isCurrentFontVariable = computed(() => {
  const cfg = currentFontConfig.value
  return cfg ? isVariableFont(cfg) : false
})

// 字重范围 (可变字体为 [min, max]，静态字体为字重数组)
const weightRange = computed(() => {
  const cfg = currentFontConfig.value
  return cfg ? getFontWeightRange(cfg) : [400]
})

// 字重滑块绑定 (用于可变字体)
const fontWeightSliderBinding = computed({
  get: () => [config.value.fontWeight],
  set: (val: number[] | undefined) => {
    if (val?.[0] !== undefined)
      config.value.fontWeight = val[0]
  },
})

// Scale 控制逻辑 (百分比 50-100 <-> 小数 0.5-1.0)
const scaleControl = computed({
  get: () => Math.round(config.value.scale * 100),
  set: (val: number | undefined) => {
    if (typeof val === 'number')
      config.value.scale = val / 100
  },
})

// Scale Slider 适配器 (Number <-> Array)
const scaleSliderBinding = computed({
  get: () => [scaleControl.value],
  set: (val: number[] | undefined) => {
    if (val?.[0] !== undefined)
      scaleControl.value = val[0]
  },
})

// decimals 滑块绑定
const decimalsSliderBinding = computed({
  get: () => [outlineConfig.value.decimals],
  set: (val: number[] | undefined) => {
    if (val?.[0] !== undefined)
      outlineConfig.value.decimals = val[0]
  },
})

// 主色绑定(同时更新圆形,箭头,线条)
const mainColor = computed({
  get: () => config.value.circleStroke,
  set: (val: string) => {
    config.value.circleStroke = val
    config.value.arrowFill = val
    config.value.lineStroke = val
  },
})

// 当前选中的主题对象
const currentTheme = computed(() => LOGO_THEMES[selectedTheme.value])

// 当前主题的变体选项
const variantOptions = computed(() => {
  return currentTheme.value?.variants || []
})

// 切换特效
function toggleEffect(effect: LogoEffect, enabled: boolean | 'indeterminate') {
  if (enabled === true) {
    if (!config.value.effects.includes(effect)) {
      config.value.effects.push(effect)
    }
  }
  else {
    config.value.effects = config.value.effects.filter(e => e !== effect)
  }
}

// 应用主题预设 (保留 effects 和透明背景设置)
function applyPreset() {
  const theme = LOGO_THEMES[selectedTheme.value]
  if (!theme)
    return

  const variant = theme.variants.find(v => v.id === selectedVariant.value)
  if (!variant)
    return

  // 保留当前的 effects 设置
  const currentEffects = [...config.value.effects]
  // 保留透明背景状态
  const isTransparent = config.value.backgroundFill === 'transparent'

  Object.assign(config.value, variant.config)

  // 更新保存的背景色为当前主题的背景色
  savedBackgroundFill.value = variant.config.backgroundFill

  // 恢复 effects
  config.value.effects = currentEffects
  // 恢复透明背景
  if (isTransparent) {
    config.value.backgroundFill = 'transparent'
  }
}

// ==================== 派生状态同步 ====================
// 使用计算属性 + setter 替代双向 watch，避免循环触发

// 形状开关：直接读写 config.backgroundRx（比例值）
const logoShape = computed({
  get: () => config.value.backgroundRx > 0,
  set: (val: boolean) => {
    config.value.backgroundRx = val ? 0.222 : 0 // 22% 圆角或方形
  },
})

// 透明背景开关：读写 config.backgroundFill
const transparentBg = computed({
  get: () => config.value.backgroundFill === 'transparent',
  set: (val: boolean) => {
    if (val) {
      // 保存当前非透明色
      if (config.value.backgroundFill !== 'transparent') {
        savedBackgroundFill.value = config.value.backgroundFill
      }
      config.value.backgroundFill = 'transparent'
    }
    else {
      config.value.backgroundFill = savedBackgroundFill.value
    }
  },
})

watch([selectedTheme, selectedVariant], applyPreset, { immediate: true })

function resetConfig() {
  Object.assign(config.value, defaultLogoConfig)
  selectedTheme.value = DEFAULT_THEME_KEY
  selectedVariant.value = DEFAULT_VARIANT_ID
  applyPreset()
}

// SVG 代码（根据 useCurrentColor 选项生成）
const baseSvgCode = computed(() => {
  const c = config.value
  const finalScale = calculateFinalScale(c)
  return generateSvg(c, finalScale, {
    useCurrentColor: useCurrentColor.value,
    includeUsageComment: useCurrentColor.value,
  })
})

// 最终显示的 SVG 代码（考虑转曲，用于显示和复制/下载）
const finalSvgCode = ref('')

// 监听变化，异步更新转曲后的代码
watchEffect(async () => {
  const base = baseSvgCode.value
  if (outlineConfig.value.enabled) {
    finalSvgCode.value = await convertTextToPath(base, config.value, outlineConfig.value)
  }
  else {
    finalSvgCode.value = base
  }
})

// ==================== 下载函数 ====================

async function handleDownloadSvg() {
  downloadSvg(finalSvgCode.value)
}

async function downloadSingle() {
  if (exportFormat.value === 'png') {
    await downloadPng(config.value, exportSize.value, outlineConfig.value)
  }
  else {
    toast.success(`正在生成 ${exportSize.value}×${exportSize.value} ICO...`)
    await downloadIco(config.value, exportSize.value, outlineConfig.value)
    toast.success('ICO 导出完成')
  }
}

async function downloadBatch() {
  const sizes = exportFormat.value === 'png'
    ? EXPORT_SIZE_OPTIONS.map(o => o.value)
    : FAVICON_ICO_SIZES.map(o => o.value)

  const format = exportFormat.value
  toast.success(`开始批量导出 ${format.toUpperCase()}...`)

  if (format === 'png') {
    await downloadPngBatch(config.value, sizes, outlineConfig.value)
  }
  else {
    await downloadIcoBatch(config.value, sizes, outlineConfig.value)
  }

  toast.success('批量导出完成')
}

async function copySvgCode() {
  try {
    await copy(finalSvgCode.value)
    toast.success('复制成功')
  }
  catch {
    toast.error('复制失败')
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 页面头部: 移动端上下排列，桌面端左右排列 -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Logo 编辑器
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          实时编辑和预览 SVG Logo
        </p>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <Button variant="outline" @click="resetConfig">
          <div class="i-ri-refresh-line mr-2 h-4 w-4" />
          重置
        </Button>
        <Button @click="handleDownloadSvg">
          <div class="i-ri-download-line mr-2 h-4 w-4" />
          SVG
        </Button>

        <!-- 格式切换 + 尺寸选择 + 导出 -->
        <div class="flex flex-wrap gap-2 items-center">
          <!-- 格式切换 -->
          <div class="flex gap-1 items-center">
            <Label class="text-sm">PNG</Label>
            <Switch
              :model-value="exportFormat === 'ico'"
              @update:model-value="exportFormat = $event ? 'ico' : 'png'"
            />
            <Label class="text-sm">ICO</Label>
          </div>

          <!-- 尺寸选择 -->
          <Select v-model="exportSize">
            <SelectTrigger class="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in currentSizeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }} - {{ opt.description }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- 导出按钮 -->
          <Button size="sm" @click="downloadSingle">
            导出
          </Button>
          <Button size="sm" variant="secondary" @click="downloadBatch">
            <div class="i-ri-stack-line mr-1 h-3 w-3" />
            批量
          </Button>
        </div>
      </div>
    </div>

    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
      <!-- 左侧:编辑面板 -->
      <Card>
        <CardHeader>
          <CardTitle>配置 Config</CardTitle>
          <CardDescription>调整 Logo 的各项参数</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- 预设主题 -->
          <div class="p-4 border rounded-lg bg-muted/30 space-y-4">
            <h3 class="text-lg font-semibold">
              预设主题
            </h3>
            <div class="gap-8 grid grid-cols-1 md:grid-cols-2">
              <div class="space-y-2">
                <Label>配色主题 Theme</Label>
                <Select v-model="selectedTheme">
                  <SelectTrigger>
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(theme, key) in LOGO_THEMES" :key="key" :value="key">
                      <span>{{ theme.colorName }} - {{ theme.label }}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>预设版本 Variant</Label>
                <Select v-model="selectedVariant">
                  <SelectTrigger>
                    <SelectValue placeholder="选择版本" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in variantOptions" :key="opt.id" :value="opt.id">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <!-- 效果选项 -->
              <div class="space-y-2 md:col-span-2">
                <Label>特效 Effects</Label>
                <div class="flex flex-wrap gap-4">
                  <div v-for="opt in LOGO_EFFECT_OPTIONS" :key="opt.value" class="flex items-center space-x-2">
                    <Checkbox
                      :id="`effect-${opt.value}`"
                      :model-value="config.effects.includes(opt.value)"
                      @update:model-value="toggleEffect(opt.value, $event)"
                    />
                    <Label :for="`effect-${opt.value}`" class="font-normal cursor-pointer">
                      {{ opt.label }}
                    </Label>
                  </div>
                </div>
                <!-- 动画开关 -->
                <div v-if="config.effects.includes('dashed')" class="pt-2 flex items-center space-x-2">
                  <Switch
                    id="animation-toggle"
                    :model-value="enableAnimation"
                    @update:model-value="enableAnimation = $event"
                  />
                  <Label for="animation-toggle" class="cursor-pointer">开启动画 Enable Animation</Label>
                </div>
              </div>
            </div>

            <!-- 形状选项 -->
            <div class="pt-4 border-t border-border/50 space-y-2">
              <Label>形状 Shape</Label>
              <div class="flex flex-wrap gap-8 items-center">
                <div class="flex items-center space-x-2">
                  <Switch id="shape-mode" :model-value="logoShape" @update:model-value="logoShape = $event" />
                  <Label for="shape-mode" class="cursor-pointer">{{ logoShape ? 'APP 圆角 Rounded' : '方形 Square' }}</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Switch id="transparent-bg" :model-value="transparentBg" @update:model-value="transparentBg = $event" />
                  <Label for="transparent-bg" class="cursor-pointer">透明背景 Transparent</Label>
                </div>
              </div>
            </div>
          </div>

          <!-- 基础设置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">
              基础设置
            </h3>

            <!-- 画布尺寸快捷控制 -->
            <div class="space-y-2">
              <Label>画布尺寸 Canvas (正方形)</Label>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input v-model.number="canvasSize" type="number" min="256" max="4096" step="1" />
                <span class="text-sm text-muted-foreground">默认 1080,可改为 512 / 1024 等</span>
              </div>
            </div>

            <!-- 缩放控制 -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label>Logo 相对缩放 Scale</Label>
                <span class="text-sm text-muted-foreground">{{ Math.round(config.scale * 100) }}%</span>
              </div>
              <div class="flex gap-4 items-center">
                <Slider v-model="scaleSliderBinding" :min="50" :max="100" :step="1" class="py-2 flex-1" />
                <Input v-model.number="scaleControl" type="number" :min="50" :max="100" :step="1" class="w-20" />
              </div>
            </div>
          </div>

          <!-- 颜色设置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">
              颜色设置
            </h3>
            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="main-color">主色 (圆圈+箭头+线条)</Label>
                <ColorPicker
                  v-model="mainColor"
                  placeholder="#E0B758 或 rgba(224,183,88,0.5)"
                />
                <p class="text-sm text-muted-foreground">
                  支持：#HEX、rgb()、rgba()、transparent
                </p>
              </div>
              <div class="space-y-2">
                <Label for="bg-fill">背景颜色</Label>
                <ColorPicker
                  v-model="config.backgroundFill"
                  placeholder="transparent 或 #111111"
                />
                <p class="text-sm text-muted-foreground">
                  透明背景适合叠加效果
                </p>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label>背景圆角比例</Label>
                <span class="text-sm text-muted-foreground">{{ Math.round(config.backgroundRx * 100) }}%</span>
              </div>
              <div class="flex gap-4 items-center">
                <Slider v-model="backgroundRxSliderBinding" :min="0" :max="50" :step="1" class="py-2 flex-1" />
                <Input v-model.number="backgroundRxControl" type="number" :min="0" :max="50" :step="1" class="w-20" />
              </div>
            </div>
          </div>

          <!-- 配置面板 -->
          <template v-for="panel in LOGO_PANELS" :key="panel.title">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">
                {{ panel.title }}
              </h3>
              <div :class="panel.width ? 'gap-4 grid grid-cols-1 sm:grid-cols-2' : ''">
                <div class="space-y-2">
                  <Label :for="panel.colorId">描边颜色</Label>
                  <div class="flex gap-2">
                    <Input :id="panel.colorId" v-model="config[panel.color as LogoColorKey]" type="color" class="p-1 h-10 w-16" />
                    <Input v-model="config[panel.color as LogoColorKey]" type="text" placeholder="transparent 或 #E0B758" class="flex-1" />
                  </div>
                  <p class="text-sm text-muted-foreground">
                    支持透明色和 RGBA 格式
                  </p>
                </div>
                <div v-if="panel.width" class="space-y-2">
                  <Label :for="panel.widthId">描边宽度</Label>
                  <Input :id="panel.widthId" v-model.number="config[panel.width as LogoWidthKey]" type="number" min="1" max="50" />
                </div>
              </div>
            </div>
          </template>

          <!-- 文字设置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">
              文字
            </h3>
            <div class="space-y-4">
              <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="text-fill">填充颜色</Label>
                  <div class="flex gap-2">
                    <Input id="text-fill" v-model="config.textFill" type="color" class="p-1 h-10 w-16" />
                    <Input v-model="config.textFill" type="text" placeholder="transparent 或 #FFFFFF" class="flex-1" />
                  </div>
                  <p class="text-sm text-muted-foreground">
                    透明文字可用于特殊效果
                  </p>
                </div>
                <div class="space-y-2">
                  <Label for="text-content">文字内容</Label>
                  <Input id="text-content" v-model="config.textContent" type="text" placeholder="争逐" />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between">
                  <Label>文字字号 Font Size</Label>
                  <span class="text-sm text-muted-foreground">{{ config.fontSize }}px</span>
                </div>
                <div class="flex gap-4 items-center">
                  <Slider v-model="fontSizeValue" :min="30" :max="120" :step="1" class="py-2 flex-1" />
                  <Input v-model.number="config.fontSize" type="number" :min="30" :max="120" :step="1" class="w-20" />
                </div>
              </div>

              <!-- 字体和字重同一行 -->
              <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label>字体 Font Family</Label>
                  <Select v-model="selectedFontFamily">
                    <SelectTrigger>
                      <SelectValue placeholder="选择字体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="(font, family) in LOGO_FONTS" :key="family" :value="family">
                        {{ font.label }} ({{ family }})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <Label>字重 Font Weight</Label>
                    <span class="text-sm text-muted-foreground">{{ config.fontWeight }}</span>
                  </div>
                  <!-- 可变字体：滑块 -->
                  <template v-if="isCurrentFontVariable && Array.isArray(weightRange) && weightRange.length === 2">
                    <div class="flex gap-4 items-center">
                      <Slider
                        v-model="fontWeightSliderBinding"
                        :min="weightRange[0]"
                        :max="weightRange[1]"
                        :step="1"
                        class="py-2 flex-1"
                      />
                      <Input v-model.number="config.fontWeight" type="number" :min="weightRange[0]" :max="weightRange[1]" class="w-20" />
                    </div>
                  </template>
                  <!-- 静态字体：下拉 -->
                  <template v-else>
                    <Select v-model.number="config.fontWeight">
                      <SelectTrigger>
                        <SelectValue placeholder="选择字重" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="weight in weightRange" :key="weight" :value="weight">
                          {{ weight }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p v-if="weightRange.length === 1" class="text-sm text-muted-foreground">
                      当前字体仅支持 {{ weightRange[0] }} 字重
                    </p>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 右侧:预览面板 -->
      <div class="space-y-6">
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle>实时预览</CardTitle>
            <CardDescription>查看 Logo 效果</CardDescription>
          </CardHeader>
          <CardContent class="p-8 flex flex-col gap-6 items-center justify-center">
            <div
              class="svg-container"
              :class="{
                'effect-dashed': config.effects.includes('dashed') && enableAnimation,
                'effect-double-ring': config.effects.includes('double-ring'),
              }"
              v-html="finalSvgCode"
            />
          </CardContent>
        </Card>

        <!-- 源代码显示 -->
        <Card>
          <CardHeader class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex-1">
              <CardTitle>SVG 源代码</CardTitle>
              <CardDescription>
                {{ useCurrentColor ? '圆形、箭头、线条、文字均使用 currentColor (背景透明)，可通过父元素 color 属性或 CSS 变量控制' : '包含具体颜色值，所见即所得' }}
              </CardDescription>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <!-- currentColor 开关 -->
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="use-current-color"
                  :model-value="useCurrentColor"
                  @update:model-value="useCurrentColor = $event === true"
                />
                <Label for="use-current-color" class="text-sm cursor-pointer">currentColor</Label>
              </div>
              <!-- 转曲开关 -->
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="outline-text"
                  :model-value="outlineConfig.enabled"
                  @update:model-value="outlineConfig.enabled = $event === true"
                />
                <Label for="outline-text" class="text-sm cursor-pointer">转曲</Label>
              </div>
              <!-- 高级转曲选项开关 -->
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="outline-options"
                  :model-value="showOutlineOptions"
                  @update:model-value="showOutlineOptions = $event === true"
                />
                <Label for="outline-options" class="text-sm cursor-pointer">高级</Label>
              </div>
              <Button size="sm" variant="outline" @click="copySvgCode">
                <div class="i-ri-file-copy-line mr-2 h-4 w-4" />
                复制
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- 高级转曲选项面板 -->
            <div v-if="showOutlineOptions && outlineConfig.enabled" class="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h4 class="text-sm font-medium">
                转曲高级选项
              </h4>
              <!-- 精度控制 -->
              <div class="space-y-2">
                <div class="flex justify-between">
                  <Label>路径精度 Decimals</Label>
                  <span class="text-sm text-muted-foreground">{{ outlineConfig.decimals }} 位小数</span>
                </div>
                <div class="flex gap-4 items-center">
                  <Slider v-model="decimalsSliderBinding" :min="1" :max="6" :step="1" class="py-2 flex-1" />
                  <Input v-model.number="outlineConfig.decimals" type="number" :min="1" :max="6" class="w-16" />
                </div>
                <p class="text-sm text-muted-foreground">
                  值越小文件越小，建议 2-3
                </p>
              </div>
              <!-- 保留原文字 -->
              <div class="space-y-2">
                <Label>保留原文字 textAttr</Label>
                <Input
                  v-model="outlineConfig.textAttr"
                  type="text"
                  placeholder="留空不保留，如 data-text"
                />
                <p class="text-sm text-muted-foreground">
                  将原文字保存到指定属性，便于搜索引擎索引
                </p>
              </div>
              <!-- 其他选项 -->
              <div class="flex flex-wrap gap-6">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="keep-font-attrs"
                    :model-value="outlineConfig.keepFontAttrs"
                    @update:model-value="outlineConfig.keepFontAttrs = $event === true"
                  />
                  <Label for="keep-font-attrs" class="text-sm cursor-pointer">保留字体属性</Label>
                </div>
              </div>
              <!-- 错误处理 -->
              <div class="space-y-2">
                <Label>字体缺失处理 noFontAction</Label>
                <Select v-model="outlineConfig.noFontAction">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in NO_FONT_ACTION_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }} - {{ opt.description }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="p-4 rounded-md bg-black">
              <pre class="text-sm text-white font-mono whitespace-pre-wrap break-words"><code>{{ finalSvgCode }}</code></pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.svg-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes logo-spin-reverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

.svg-container.effect-dashed :deep(circle) {
  transform-origin: 0 0;
  animation: logo-spin 60s linear infinite;
}

.svg-container.effect-dashed.effect-double-ring :deep(circle:nth-of-type(2)) {
  animation: logo-spin-reverse 45s linear infinite;
}
</style>
