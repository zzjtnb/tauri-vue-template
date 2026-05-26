<script setup lang="ts">
import type { Layout } from '../../../../types/public'
import { computed, reactive } from 'vue'
import { defaultLayoutState } from '../../../../runtime/defaults'

const props = withDefaults(defineProps<{
  state: Layout['State']
  showClose?: boolean
  flush?: boolean
  compact?: boolean
}>(), {
  showClose: false,
  flush: false,
  compact: false,
})

const emit = defineEmits<{
  close: []
}>()

const preferences = computed(() => props.state.preferences)
// defaultLayoutState 是库级常量，设置内容只读取克隆副本用于重置，绝不直接修改默认常量。
const defaultPreferences: Layout['Preferences'] = structuredClone(defaultLayoutState.preferences)

type SettingChoice<T, Extra extends object = object> = Readonly<{ value: T, title: string } & Extra>
type PageElementOption = Readonly<{ key: keyof Layout['Preferences']['pageElements'], title: string, description: string, ariaLabel: string }>
type PreviewPart = Readonly<{ class: string, children?: readonly PreviewPart[] }>
type LayoutPreview = Readonly<{ class: string, parts: readonly PreviewPart[] }>

const previews: Record<'route' | NonNullable<Layout['Preferences']['layoutMode']>, LayoutPreview> = {
  route: {
    class: 'rounded flex flex-col gap-1 h-full w-full',
    parts: [{ class: 'rounded-sm bg-primary/30 h-1/5' }, { class: 'rounded-sm bg-background flex-1' }],
  },
  sidebar: {
    class: 'rounded flex gap-1 h-full w-full',
    parts: [{ class: 'rounded-sm bg-primary/40 w-1/3' }, { class: 'rounded-sm bg-background flex-1' }],
  },
  topnav: {
    class: 'rounded flex flex-col gap-1 h-full w-full',
    parts: [{ class: 'rounded-sm bg-primary/40 h-1/4' }, { class: 'rounded-sm bg-background flex-1' }],
  },
  hybrid: {
    class: 'rounded flex flex-col gap-1 h-full w-full',
    parts: [
      { class: 'rounded-sm bg-primary/40 h-1/5' },
      { class: 'flex flex-1 gap-1 min-h-0', children: [{ class: 'rounded-sm bg-primary/20 w-1/4' }, { class: 'rounded-sm bg-background flex-1' }] },
    ],
  },
}

// 设置项统一包装成 { value, options }，模板只关心当前值和可选项，不需要知道状态在 preferences 的哪一层。
function setting<T extends object, K extends keyof T, TOptions extends readonly unknown[]>(target: () => T, key: K, options: TOptions) {
  return reactive({
    value: computed({
      get: () => target()[key],
      set: (value) => {
        target()[key] = value
      },
    }),
    options,
  })
}

const menuModeOptions = [
  { value: 'collapse', title: '折叠', description: '菜单分组默认折叠，点击父级展开。' },
  { value: 'expand', title: '展开', description: '一级分组默认展开，子层级仍需单独展开。' },
] satisfies readonly SettingChoice<Layout['Preferences']['navigation']['sidebar']['menuMode'], { description: string }>[]

const themeMode = setting(() => preferences.value.theme, 'mode', [
  { value: 'system', title: '跟随系统', icon: 'i-lucide-monitor' },
  { value: 'light', title: '明亮', icon: 'i-lucide-sun' },
  { value: 'dark', title: '暗黑', icon: 'i-lucide-moon' },
] satisfies readonly SettingChoice<Layout['Preferences']['theme']['mode'], { icon: string }>[])
const themeColor = setting(() => preferences.value.theme, 'color', [
  { value: 'neutral', title: '官方默认', subtitle: 'neutral' },
  { value: 'blue', title: '天空蓝', subtitle: 'blue' },
  { value: 'violet', title: '紫罗兰', subtitle: 'violet' },
  { value: 'teal', title: '青绿色', subtitle: 'teal' },
  { value: 'rose', title: '玫瑰色', subtitle: 'rose' },
  { value: 'amber', title: '琥珀暖阳', subtitle: 'amber' },
] satisfies readonly SettingChoice<Layout['Preferences']['theme']['color'], { subtitle: string }>[])
const layoutMode = setting(() => preferences.value, 'layoutMode', [
  { value: null, title: '跟随路由', preview: previews.route },
  { value: 'sidebar', title: '侧边菜单', preview: previews.sidebar },
  { value: 'topnav', title: '顶部菜单', preview: previews.topnav },
  { value: 'hybrid', title: '混合菜单', preview: previews.hybrid },
] satisfies readonly SettingChoice<Layout['Preferences']['layoutMode'], { preview: LayoutPreview }>[])
const sidebarCollapse = setting(() => preferences.value.navigation.sidebar, 'collapseMode', [
  { value: 'auto', title: '智能', description: '折叠后桌面端保留窄栏，移动端直接隐藏。' },
  { value: 'rail', title: '窄栏', description: '折叠后保留图标入口，适合桌面端快速切换。' },
  { value: 'hidden', title: '隐藏', description: '折叠后完全释放侧边栏宽度。' },
] satisfies readonly SettingChoice<Layout['Preferences']['navigation']['sidebar']['collapseMode'], { description: string }>[])
const sidebarMenu = setting(() => preferences.value.navigation.sidebar, 'menuMode', menuModeOptions)
const topnavMenu = setting(() => preferences.value.navigation.topnav, 'menuMode', menuModeOptions)
const pageElements = setting(() => preferences.value, 'pageElements', [
  {
    key: 'tabs',
    title: '页面页签',
    description: '展示固定页签与已访问页签。',
    ariaLabel: '切换页面页签显示',
  },
  {
    key: 'breadcrumb',
    title: '面包屑',
    description: '展示当前页面在菜单结构中的位置。',
    ariaLabel: '切换面包屑显示',
  },
  {
    key: 'headerFixed',
    title: '固定顶部栏',
    description: '顶部栏固定在当前布局列顶部。',
    ariaLabel: '切换固定顶部栏',
  },
  {
    key: 'footerFixed',
    title: '固定底部栏',
    description: '底部栏固定在当前布局列底部。',
    ariaLabel: '切换固定底部栏',
  },
] satisfies readonly PageElementOption[])

const ui = {
  content: 'flex-1 min-h-0 overflow-auto',
  pageGrid: 'xl:gap-3 xl:grid 2xl:grid-cols-20 xl:grid-cols-16 xl:items-stretch xl:overflow-visible',
  section: 'py-4 border-b border-border xl:p-3 xl:border xl:rounded-2xl xl:bg-background/70',
  compactSection: 'py-4 border-b border-border',
  heading: 'text-sm font-semibold mb-3 mt-0 flex gap-2 items-center',
  choice: {
    base: 'border transition',
    idle: 'border-border hover:border-primary/50 hover:bg-primary/5',
    active: 'border-primary bg-primary/5',
  },
} as const

const contentUi = computed(() => [
  ui.content,
  props.compact ? undefined : ui.pageGrid,
  props.flush ? 'px-0 pb-0' : 'px-4 pb-4',
])
const sectionUi = computed(() => props.compact ? ui.compactSection : ui.section)
const modeGrid = computed(() => props.compact ? 'gap-2 grid grid-cols-3' : 'gap-2 grid grid-cols-3 2xl:grid-cols-3 xl:grid-cols-1')
const colorGrid = computed(() => props.compact ? 'gap-3 grid grid-cols-2' : 'gap-3 grid grid-cols-2 2xl:grid-cols-6 xl:grid-cols-3')
const layoutGrid = computed(() => props.compact ? 'gap-3 grid grid-cols-2' : 'gap-3 grid grid-cols-4')
const navSection = computed(() => props.compact
  ? ui.compactSection
  : 'py-4 xl:p-3 xl:border xl:border-border xl:rounded-2xl xl:bg-background/70 xl:flex xl:flex-col 2xl:col-span-10 xl:col-span-9 xl:min-h-0')
const navBody = computed(() => props.compact ? 'flex flex-col gap-3' : 'flex flex-1 flex-col gap-3 xl:grid xl:grid-rows-3 xl:min-h-0')

function toggleElement(key: keyof Layout['Preferences']['pageElements']): void {
  pageElements.value[key] = !pageElements.value[key]
}

function navGroup<T extends string>(config: {
  key: string
  title: string
  ariaLabel: string
  gridClass: string
  setting: {
    value: T
    options: readonly Readonly<{ value: T, title: string, description: string }>[]
  }
}) {
  return {
    key: config.key,
    title: config.title,
    ariaLabel: config.ariaLabel,
    gridClass: config.gridClass,
    options: config.setting.options.map(item => ({
      ...item,
      active: config.setting.value === item.value,
      ariaLabel: `设置${config.title}为${item.title}`,
      select: () => {
        config.setting.value = item.value
      },
    })),
  }
}

// 导航设置项结构一致，先在 script 中归一成渲染模型，避免模板里重复处理 aria-label、active 和 select 动作。
const navGroups = computed(() => [
  navGroup({
    key: 'sidebar-collapse',
    title: '侧边栏显示隐藏',
    ariaLabel: '侧边栏显示隐藏选项',
    gridClass: props.compact ? 'gap-2 grid' : 'gap-2 grid md:grid-cols-3',
    setting: sidebarCollapse,
  }),
  navGroup({
    key: 'sidebar-menu',
    title: '侧边栏子菜单',
    ariaLabel: '侧边栏子菜单选项',
    gridClass: props.compact ? 'gap-2 grid' : 'gap-2 grid grid-cols-2',
    setting: sidebarMenu,
  }),
  navGroup({
    key: 'topnav-menu',
    title: '顶部导航子菜单',
    ariaLabel: '顶部导航子菜单选项',
    gridClass: props.compact ? 'gap-2 grid' : 'gap-2 grid grid-cols-2',
    setting: topnavMenu,
  }),
])

function choiceClass(active: boolean) {
  return [ui.choice.base, active ? ui.choice.active : ui.choice.idle]
}

function layoutClass(active: boolean) {
  return [
    'border rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
    active ? `${ui.choice.active} hover:border-primary hover:bg-primary/5` : ui.choice.idle,
  ]
}

function trackClass(checked: boolean) {
  return [
    'p-0.5 border rounded-full inline-flex h-6 w-11 shrink-0 items-center transition-colors',
    checked ? 'border-primary bg-primary' : 'border-border bg-muted',
  ]
}

function thumbClass(checked: boolean) {
  return [
    'rounded-full bg-background size-5 shadow-sm transition-transform',
    checked ? 'translate-x-5' : 'translate-x-0',
  ]
}

// 只重置 preferences；ui.settings.open 和 ui.sidebar.mode 属于运行态，不应该因为“重置默认”被改写。
function reset(): void {
  preferences.value.layoutMode = defaultPreferences.layoutMode
  Object.assign(preferences.value.theme, defaultPreferences.theme)
  Object.assign(preferences.value.navigation.sidebar, defaultPreferences.navigation.sidebar)
  Object.assign(preferences.value.navigation.topnav, defaultPreferences.navigation.topnav)
  Object.assign(preferences.value.pageElements, defaultPreferences.pageElements)
}
</script>

<template>
  <div class="flex flex-col min-h-0">
    <div :class="contentUi">
      <section class="2xl:col-span-5 xl:col-span-5" :class="sectionUi" aria-label="主题模式设置">
        <h3 :class="ui.heading">
          <span class="i-lucide-sun-medium size-4" aria-hidden="true" />
          主题模式
        </h3>
        <div :class="modeGrid" role="radiogroup" aria-label="主题模式">
          <button
            v-for="item in themeMode.options"
            :key="item.value"
            type="button"
            class="text-sm font-medium px-3 py-2 text-center rounded-lg 2xl:text-center xl:text-left xl:flex xl:gap-2 2xl:min-h-0 xl:min-h-12 2xl:block xl:items-center"
            role="radio"
            :class="choiceClass(themeMode.value === item.value)"
            :aria-checked="themeMode.value === item.value"
            :aria-label="`切换主题模式为${item.title}`"
            @click="themeMode.value = item.value"
          >
            <span class="mx-auto mb-1 size-5 block 2xl:mx-auto xl:mx-0 2xl:mb-1 xl:mb-0" :class="item.icon" aria-hidden="true" />
            {{ item.title }}
          </button>
        </div>
      </section>

      <section class="2xl:col-span-15 xl:col-span-11" :class="sectionUi" aria-label="主题颜色设置">
        <h3 :class="ui.heading">
          <span class="i-lucide-palette size-4" aria-hidden="true" />
          主题颜色
        </h3>
        <div :class="colorGrid" role="radiogroup" aria-label="主题颜色">
          <button
            v-for="item in themeColor.options"
            :key="item.value"
            type="button"
            role="radio"
            :aria-checked="themeColor.value === item.value"
            :aria-label="`切换主题颜色为${item.title}`"
            class="p-2.5 text-left rounded-2xl hover:-translate-y-0.5"
            :class="[item.value, choiceClass(themeColor.value === item.value)]"
            @click="themeColor.value = item.value"
          >
            <div class="flex gap-3 items-start justify-between">
              <div>
                <p class="text-sm font-semibold m-0">
                  {{ item.title }}
                </p>
                <p class="text-xs text-muted-foreground m-0">
                  {{ item.subtitle }}
                </p>
              </div>
              <span class="text-primary border border-border rounded-full bg-background flex size-5 items-center justify-center">
                <span v-if="themeColor.value === item.value" class="i-lucide-check size-3.5" aria-hidden="true" />
              </span>
            </div>
            <div class="mt-3 gap-2 grid grid-cols-4" aria-hidden="true">
              <span class="border border-border rounded-lg bg-primary h-5" />
              <span class="border border-border rounded-lg bg-secondary h-5" />
              <span class="border border-border rounded-lg bg-accent h-5" />
              <span class="border border-border rounded-lg bg-background h-5" />
            </div>
          </button>
        </div>
      </section>

      <section class="2xl:col-span-10 xl:col-span-7" :class="sectionUi" aria-label="普通页面布局模式设置">
        <h3 :class="ui.heading">
          <span class="i-lucide-layout-panel-top size-4" aria-hidden="true" />
          普通页面布局模式
        </h3>
        <p class="text-xs text-muted-foreground mb-3 mt-0">
          只影响未声明自定义区域的标准页面；自定义区域页面始终跟随路由布局声明。
        </p>
        <div :class="layoutGrid" role="radiogroup" aria-label="普通页面布局模式">
          <button
            v-for="item in layoutMode.options"
            :key="item.value ?? 'route-default'"
            type="button"
            class="p-2"
            role="radio"
            :aria-checked="layoutMode.value === item.value"
            :class="layoutClass(layoutMode.value === item.value)"
            :aria-label="item.value === null ? '布局模式跟随当前路由' : `切换布局模式为${item.title}`"
            @click="layoutMode.value = item.value"
          >
            <span class="p-2 rounded-xl bg-muted aspect-[4/3] block 2xl:h-28 xl:h-24 xl:aspect-auto">
              <span :class="item.preview.class">
                <span v-for="(part, partIndex) in item.preview.parts" :key="partIndex" :class="part.class">
                  <span v-for="(child, childIndex) in part.children ?? []" :key="childIndex" :class="child.class" />
                </span>
              </span>
            </span>
            <span class="text-sm font-semibold mt-2 block" :class="layoutMode.value === item.value ? undefined : 'text-muted-foreground'">{{ item.title }}</span>
          </button>
        </div>

        <div class="mt-3 pt-3 border-t border-border">
          <h3 :class="ui.heading">
            <span class="i-lucide-panel-top size-4" aria-hidden="true" />
            页面元素
          </h3>
          <div class="gap-2 grid 2xl:grid-cols-2">
            <button
              v-for="item in pageElements.options"
              :key="item.key"
              type="button"
              class="px-3 py-2.5 text-left border rounded-xl flex gap-3 min-w-0 w-full transition items-center justify-between focus-visible:outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/25"
              role="switch"
              :aria-checked="pageElements.value[item.key]"
              :aria-label="item.ariaLabel"
              :class="pageElements.value[item.key] ? 'border-primary/40 bg-primary/5' : 'border-border'"
              @click="toggleElement(item.key)"
            >
              <span class="min-w-0">
                <span class="text-sm font-semibold block">{{ item.title }}</span>
                <span class="text-xs text-muted-foreground mt-1 block">{{ item.description }}</span>
              </span>
              <span :class="trackClass(pageElements.value[item.key])">
                <span :class="thumbClass(pageElements.value[item.key])" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <section :class="navSection" aria-label="导航菜单设置">
        <h3 :class="ui.heading">
          <span class="i-lucide-list-tree size-4" aria-hidden="true" />
          导航菜单
        </h3>
        <div :class="navBody">
          <div v-for="group in navGroups" :key="group.key" class="flex flex-col min-h-0">
            <p class="text-xs text-muted-foreground mb-2 mt-0">
              {{ group.title }}
            </p>
            <div class="flex-1" :aria-label="group.ariaLabel" :class="group.gridClass">
              <button
                v-for="item in group.options"
                :key="`${group.key}-${item.value}`"
                type="button"
                class="p-2.5 text-left rounded-lg xl:p-3 xl:flex xl:flex-col xl:justify-center"
                :class="choiceClass(item.active)"
                :aria-label="item.ariaLabel"
                @click="item.select()"
              >
                <span class="text-sm font-semibold block">{{ item.title }}</span>
                <span class="text-xs text-muted-foreground leading-5 mt-1 block">{{ item.description }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <footer class="flex shrink-0 flex-wrap gap-2 items-center justify-between" :class="props.flush ? 'px-0 pt-2 pb-0 border-t-0' : 'px-4 py-3 border-t border-border'" aria-label="设置面板底部操作">
      <button type="button" class="text-sm text-destructive font-semibold px-3.5 py-2 border border-destructive/25 rounded-xl bg-destructive/10 flex gap-2 shadow-sm transition items-center focus-visible:outline-none hover:border-destructive/40 hover:bg-destructive/15 focus-visible:ring-2 focus-visible:ring-destructive/25" aria-label="重置布局设置为默认值" @click="reset">
        <span class="i-lucide-rotate-ccw size-4" aria-hidden="true" />
        重置默认
      </button>
      <button v-if="props.showClose" type="button" class="text-sm text-primary-foreground font-medium ml-auto px-4 py-2 rounded-xl bg-primary transition focus-visible:outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/25" aria-label="关闭设置面板" @click="emit('close')">
        关闭
      </button>
    </footer>
  </div>
</template>
