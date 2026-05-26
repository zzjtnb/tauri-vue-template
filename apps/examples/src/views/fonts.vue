<script setup lang="ts">
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tauri-vue-template/ui'

const fontFamilies = [
  {
    key: 'sans',
    title: '界面正文字体',
    utility: 'font-sans',
    stack: 'Nunito Sans + system-ui, sans-serif',
    source: 'presetWebFonts.sans + theme.font.sans',
    description: '用于正文、表单和普通界面文本；远程只加载 Nunito Sans，中文字符交给系统中文字体兜底。',
    samples: ['项目工作台 · Dashboard overview', '表单说明 · Field description', '0123456789 / ABC xyz'],
  },
  {
    key: 'serif',
    title: '标题展示字体',
    utility: 'font-serif',
    stack: 'Nunito Sans + system-ui, sans-serif',
    source: 'theme.font.serif + base.css 标题规则',
    description: '本项目把 serif 作为标题/展示语义使用；当前实际字体栈仍是 Nunito Sans 与系统字体，而不是额外中文书法字体。',
    samples: ['示例展示', '前端开发最佳实践', 'Build reliable agent interfaces'],
  },
  {
    key: 'mono',
    title: '代码等宽字体',
    utility: 'font-mono',
    stack: 'Fira Code + ui-monospace, monospace',
    source: 'presetWebFonts.mono + theme.font.mono',
    description: '用于代码、密钥、日志、卡号和数字信息；Fira Code 支持常见编程连字。',
    samples: ['import { computed } from \'vue\'', 'const count = value >= 10 ? 1 : 0', '!= !== == === <= >= => ->'],
  },
] as const

const fontWeights = [
  { class: 'font-light', value: 300, name: 'Light' },
  { class: 'font-normal', value: 400, name: 'Normal' },
  { class: 'font-medium', value: 500, name: 'Medium' },
  { class: 'font-semibold', value: 600, name: 'Semibold' },
  { class: 'font-bold', value: 700, name: 'Bold' },
  { class: 'font-extrabold', value: 800, name: 'Extrabold' },
  { class: 'font-black', value: 900, name: 'Black' },
] as const

const fontSizes = [
  { class: 'text-xs', size: '12px', name: 'xs' },
  { class: 'text-sm', size: '14px', name: 'sm' },
  { class: 'text-base', size: '16px', name: 'base' },
  { class: 'text-lg', size: '18px', name: 'lg' },
  { class: 'text-xl', size: '20px', name: 'xl' },
  { class: 'text-2xl', size: '24px', name: '2xl' },
] as const

const headingLevels = [
  { tag: 'h1', class: 'text-5xl', name: 'H1' },
  { tag: 'h2', class: 'text-4xl', name: 'H2' },
  { tag: 'h3', class: 'text-3xl', name: 'H3' },
  { tag: 'h4', class: 'text-2xl', name: 'H4' },
  { tag: 'h5', class: 'text-xl', name: 'H5' },
  { tag: 'h6', class: 'text-lg', name: 'H6' },
] as const
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold font-serif">
        字体系统
      </h1>
      <p class="text-muted-foreground">
        与 uno.config.ts 当前配置对齐：远程字体只加载 Nunito Sans 和 Fira Code，中文字体使用系统兜底。
      </p>
    </div>

    <section class="gap-4 grid lg:grid-cols-3" aria-label="字体语义总览">
      <Card v-for="font in fontFamilies" :key="font.key">
        <CardHeader>
          <CardTitle>{{ font.title }}</CardTitle>
          <CardDescription>{{ font.utility }} · {{ font.stack }}</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <p class="text-sm text-muted-foreground leading-6">
            {{ font.description }}
          </p>
          <div class="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {{ font.source }}
            </Badge>
          </div>
          <div class="flex flex-col gap-2">
            <p v-for="sample in font.samples" :key="sample" class="text-lg" :class="font.utility">
              {{ sample }}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>

    <Card>
      <CardHeader>
        <CardTitle>字重与字号</CardTitle>
        <CardDescription>展示当前 UnoCSS 字体工具类在实际页面中的渲染效果。</CardDescription>
      </CardHeader>
      <CardContent class="gap-6 grid lg:grid-cols-2">
        <div class="flex flex-col gap-3">
          <h2 class="text-base font-semibold">
            Nunito Sans 字重
          </h2>
          <p
            v-for="{ class: weightClass, value, name } in fontWeights"
            :key="weightClass"
            class="text-2xl font-sans"
            :class="weightClass"
          >
            {{ value }} {{ name }} · 字体系统示例
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <h2 class="text-base font-semibold">
            默认字号
          </h2>
          <p
            v-for="{ class: sizeClass, size, name } in fontSizes"
            :key="sizeClass"
            class="font-sans"
            :class="sizeClass"
          >
            text-{{ name }} / {{ size }} · 适合不同信息层级
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>标题层级</CardTitle>
        <CardDescription>标题默认由 base.css 接入 var(--font-serif)，页面可显式使用 font-serif。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <component
          :is="tag"
          v-for="{ tag, class: sizeClass, name } in headingLevels"
          :key="tag"
          class="font-semibold font-serif"
          :class="sizeClass"
        >
          {{ name }} 标题 · Heading typography
        </component>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>代码与数字</CardTitle>
        <CardDescription>Fira Code 由 presetWebFonts.mono 加载，Wind4 reset 的 code/pre 也接入 --font-mono。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="p-4 rounded-lg bg-muted flex flex-col gap-2">
          <code v-for="sample in fontFamilies[2].samples" :key="sample" class="text-sm font-mono block">
            {{ sample }}
          </code>
        </div>
        <p class="text-base font-sans">
          段落中的内联代码：<code class="text-sm font-mono px-1.5 py-0.5 rounded bg-muted">const value = 42</code>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
