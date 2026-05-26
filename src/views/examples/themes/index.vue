<script setup lang="ts">
import type { ColorValue } from './types'
import type { Layout } from '@/components/layouts'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LayoutRuntime } from '@/components/layouts'
import { Badge } from '@/components/shadcn-vue/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-vue/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn-vue/ui/toggle-group'
import { disposeColorResolver, getCssVarName, readThemeColorValues, themeColorInfos } from './color-values'

const layoutContext = LayoutRuntime.context.use()
const colorInfos = themeColorInfos
const colorValues = ref<Record<string, ColorValue>>({})
const themeColorOptions = [
  { value: 'neutral', title: '官方默认', description: 'neutral' },
  { value: 'blue', title: '天空蓝', description: 'blue' },
  { value: 'violet', title: '紫罗兰', description: 'violet' },
  { value: 'teal', title: '青绿色', description: 'teal' },
  { value: 'rose', title: '玫瑰色', description: 'rose' },
  { value: 'amber', title: '琥珀暖阳', description: 'amber' },
] satisfies Array<{ value: Layout['Theme']['Color'], title: string, description: string }>
const themeModeOptions = [
  { value: 'light', title: '亮色', description: '查看 light token 在当前主题色下的实际值。' },
  { value: 'dark', title: '暗色', description: '查看 dark token 在当前主题色下的实际值。' },
] satisfies Array<{ value: Exclude<Layout['Theme']['Mode'], 'system'>, title: string, description: string }>
const currentThemeMode = computed(() => layoutContext.settings.preferences.theme.mode)
const selectedThemeColor = computed(() => layoutContext.settings.preferences.theme.color)
const effectiveThemeMode = ref<Exclude<Layout['Theme']['Mode'], 'system'>>('light')
const selectedThemeMode = computed(() => currentThemeMode.value === 'system' ? effectiveThemeMode.value : currentThemeMode.value)

function refreshColorValues(): void {
  effectiveThemeMode.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  colorValues.value = readThemeColorValues(colorInfos)
}

function selectThemeColor(color: unknown): void {
  if (themeColorOptions.some(item => item.value === color)) {
    layoutContext.settings.preferences.theme.color = color as Layout['Theme']['Color']
  }
}

function selectThemeMode(mode: unknown): void {
  if (mode === 'light' || mode === 'dark') {
    layoutContext.settings.preferences.theme.mode = mode
  }
}

let themeObserver: MutationObserver | null = null

onMounted(() => {
  refreshColorValues()
  themeObserver = new MutationObserver(refreshColorValues)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null
  disposeColorResolver()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 页面标题 -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold font-serif">
        主题配色
      </h1>
      <p class="text-sm text-muted-foreground">
        与 src/assets/styles/theme/tokens/*.css 对齐，展示 6 套主题色和 36 个语义颜色 token。
      </p>
    </div>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">
          主题切换
        </CardTitle>
        <CardDescription class="text-sm">
          当前主题色为 {{ selectedThemeColor }}，实际明暗模式为 {{ effectiveThemeMode === 'dark' ? '暗色' : '亮色' }}；切换后下方变量会重新读取 documentElement 上的 token。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-sm font-semibold">
            主题色
          </h2>
          <ToggleGroup
            type="single"
            :model-value="selectedThemeColor"
            :spacing="2"
            class="flex-wrap"
            aria-label="主题色"
            @update:model-value="selectThemeColor"
          >
            <ToggleGroupItem
              v-for="item in themeColorOptions"
              :key="item.value"
              :value="item.value"
              variant="outline"
              class="py-3 flex-col h-auto min-w-30 items-start"
            >
              <span class="font-semibold">{{ item.title }}</span>
              <span class="text-xs opacity-75">{{ item.description }}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-sm font-semibold">
            明暗模式
          </h2>
          <ToggleGroup
            type="single"
            :model-value="selectedThemeMode"
            :spacing="3"
            class="flex-wrap"
            aria-label="主题明暗模式"
            @update:model-value="selectThemeMode"
          >
            <ToggleGroupItem
              v-for="item in themeModeOptions"
              :key="item.value"
              :value="item.value"
              variant="outline"
              class="py-3 flex-col h-auto min-w-34 items-start"
            >
              <span class="font-semibold">{{ item.title }}</span>
              <span class="text-xs opacity-75">{{ item.description }}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 颜色变量清单 -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">
          颜色变量清单（{{ colorInfos.length }} 个）
        </CardTitle>
        <CardDescription class="text-sm">
          直接读取当前 documentElement 上的 CSS 变量，并交给浏览器 CSS 引擎解析
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="gap-3 grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="{ name, usage } in colorInfos"
            :key="name"
            class="p-3 border rounded-lg bg-background flex flex-col gap-3 min-w-0 hover:bg-muted/50"
          >
            <div class="flex gap-3 items-start">
              <div
                class="border-2 rounded shrink-0 size-12"
                :style="{ backgroundColor: `var(${getCssVarName(name)})` }"
              />
              <div class="flex flex-col gap-1 min-w-0">
                <span class="text-xs text-muted-foreground">变量名</span>
                <code class="text-sm font-mono font-semibold break-all">{{ getCssVarName(name) }}</code>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm text-muted-foreground">使用场景</span>
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="scene in usage.scenes"
                  :key="`scene:${name}:${scene}`"
                  variant="secondary"
                  class="leading-5 text-left shrink max-w-full whitespace-normal break-words"
                >
                  {{ scene }}
                </Badge>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm text-muted-foreground">相关组件</span>
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="component in usage.components"
                  :key="`component:${name}:${component}`"
                  variant="outline"
                  class="leading-5 text-left shrink max-w-full whitespace-normal break-words"
                >
                  {{ component }}
                </Badge>
              </div>
            </div>

            <div class="text-sm min-w-0">
              <span class="text-muted-foreground">变量值</span>
              <code class="text-xs font-mono font-semibold mt-1 px-2 py-1 rounded bg-muted block break-all">
                {{ colorValues[name]?.raw }}
              </code>
            </div>

            <div class="text-sm min-w-0">
              <span class="text-muted-foreground">浏览器解析</span>
              <code class="text-xs text-muted-foreground font-mono mt-1 px-2 py-1 rounded bg-muted block break-all">
                {{ colorValues[name]?.resolved }}
              </code>
            </div>
          </article>
        </div>
      </CardContent>
    </Card>

    <!-- 实际应用示例 -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">
          实际应用示例
        </CardTitle>
        <CardDescription class="text-sm">
          查看颜色在实际组件中的应用效果
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <!-- 文字颜色 -->
        <div class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold">
            文字颜色
          </h3>
          <div class="flex flex-col gap-1">
            <p class="text-sm">
              前景色 - 主要内容文字
            </p>
            <p class="text-sm text-muted-foreground">
              柔和色 - 次要说明文字
            </p>
            <p class="text-sm text-primary">
              主色 - 链接和强调内容
            </p>
            <p class="text-sm text-destructive">
              危险色 - 错误和警告提示
            </p>
          </div>
        </div>

        <!-- 背景颜色 -->
        <div class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold">
            背景颜色
          </h3>
          <div class="gap-2 grid grid-cols-2">
            <div class="p-3 rounded-md bg-muted">
              <p class="text-sm text-muted-foreground">
                柔和背景
              </p>
            </div>
            <div class="p-3 rounded-md bg-accent">
              <p class="text-sm text-accent-foreground">
                强调背景
              </p>
            </div>
            <div class="p-3 rounded-md bg-primary">
              <p class="text-sm text-primary-foreground">
                主色背景
              </p>
            </div>
            <div class="p-3 rounded-md bg-destructive">
              <p class="text-sm text-destructive-foreground">
                危险背景
              </p>
            </div>
          </div>
        </div>

        <!-- 边框和输入 -->
        <div class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold">
            边框和输入
          </h3>
          <div class="flex flex-col gap-2">
            <div class="p-3 border rounded-md">
              <p class="text-sm text-muted-foreground">
                默认边框样式
              </p>
            </div>
            <div class="p-3 border-2 border-input rounded-md">
              <p class="text-sm text-muted-foreground">
                输入框边框样式
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
