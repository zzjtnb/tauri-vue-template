import type { ColorInfo, ColorValue } from './types'

/**
 * 与 packages/theme/src/styles/theme/tokens/*.css 对齐：
 * - --radius 是非颜色变量，不在主题配色页展示
 * - 颜色 token 共 36 个
 */
export const themeColorInfos = [
  {
    name: 'background',
    usage: {
      scenes: ['页面底色', '应用主画布', '弹窗/抽屉内容底色'],
      components: ['AppLayout', 'DialogContent', 'SheetContent', 'DrawerContent', 'Button outline'],
    },
  },
  {
    name: 'foreground',
    usage: {
      scenes: ['默认正文', '标题文字', '高优先级内容'],
      components: ['Typography', 'TabsTrigger', 'Input file label'],
    },
  },
  {
    name: 'primary',
    usage: {
      scenes: ['主要操作', '关键链接', '选中状态'],
      components: ['Button default', 'Badge default', 'Checkbox checked', 'RadioGroupItem', 'Switch checked'],
    },
  },
  {
    name: 'primary-foreground',
    usage: {
      scenes: ['主色背景上的文字', '主色选中态图标'],
      components: ['Button default', 'Badge default', 'Checkbox checked', 'selection text'],
    },
  },
  {
    name: 'card',
    usage: {
      scenes: ['承载容器背景', '信息卡片', '提示卡片'],
      components: ['Card', 'Alert'],
    },
  },
  {
    name: 'card-foreground',
    usage: {
      scenes: ['承载容器内文字', '卡片主体内容'],
      components: ['Card', 'Alert'],
    },
  },
  {
    name: 'popover',
    usage: {
      scenes: ['浮层背景', '菜单面板', '选择器面板'],
      components: ['PopoverContent', 'DropdownMenuContent', 'SelectContent', 'ComboboxList', 'Command', 'NavigationMenuViewport'],
    },
  },
  {
    name: 'popover-foreground',
    usage: {
      scenes: ['浮层文字', '菜单项内容', '选择器内容'],
      components: ['PopoverContent', 'DropdownMenuContent', 'SelectContent', 'ComboboxList', 'Command'],
    },
  },
  {
    name: 'secondary',
    usage: {
      scenes: ['次级操作背景', '低强调信息', '关闭按钮打开态'],
      components: ['Button secondary', 'Badge secondary', 'TagsInputItem', 'Sheet close button'],
    },
  },
  {
    name: 'secondary-foreground',
    usage: {
      scenes: ['次级背景上的文字', '低强调操作文字'],
      components: ['Button secondary', 'Badge secondary'],
    },
  },
  {
    name: 'muted',
    usage: {
      scenes: ['弱化区域背景', '轨道/占位背景', '非交互辅助底色'],
      components: ['SliderTrack', 'AvatarFallback', 'Kbd', 'ButtonGroupText', 'StepperSeparator'],
    },
  },
  {
    name: 'muted-foreground',
    usage: {
      scenes: ['说明文字', '占位提示', '禁用/次要文字'],
      components: ['FieldDescription', 'DialogDescription', 'SelectLabel', 'BreadcrumbList', 'CommandShortcut'],
    },
  },
  {
    name: 'accent',
    usage: {
      scenes: ['悬停背景', '高亮项背景', '切换选中背景'],
      components: ['Toggle on', 'DropdownMenuItem focus', 'SelectItem focus', 'Calendar today', 'NavigationMenuTrigger hover'],
    },
  },
  {
    name: 'accent-foreground',
    usage: {
      scenes: ['高亮背景上的文字', '菜单聚焦文字'],
      components: ['Toggle on', 'DropdownMenuItem focus', 'SelectItem focus', 'Calendar today', 'NavigationMenuTrigger hover'],
    },
  },
  {
    name: 'destructive',
    usage: {
      scenes: ['危险操作', '错误背景', '校验失败状态'],
      components: ['Button destructive', 'Badge destructive', 'Alert destructive', 'FieldError', 'Input aria-invalid'],
    },
  },
  {
    name: 'destructive-foreground',
    usage: {
      scenes: ['危险背景上的文字', '危险操作图标'],
      components: ['Button destructive', 'Badge destructive', 'Alert destructive'],
    },
  },
  {
    name: 'success',
    usage: {
      scenes: ['成功状态', '完成反馈', '正向结果提示'],
      components: ['StatusBadge', 'Toast success', 'Task status'],
    },
  },
  {
    name: 'success-foreground',
    usage: {
      scenes: ['成功背景上的文字', '成功状态图标'],
      components: ['StatusBadge', 'Toast success', 'Task status'],
    },
  },
  {
    name: 'warning',
    usage: {
      scenes: ['警告状态', '待处理状态', '非破坏性风险提示'],
      components: ['StatusBadge', 'Toast warning', 'Task status'],
    },
  },
  {
    name: 'warning-foreground',
    usage: {
      scenes: ['警告背景上的文字', '警告状态图标'],
      components: ['StatusBadge', 'Toast warning', 'Task status'],
    },
  },
  {
    name: 'border',
    usage: {
      scenes: ['通用边框', '容器分割', '面板描边'],
      components: ['Card', 'AlertDialogContent', 'PopoverContent', 'Separator'],
    },
  },
  {
    name: 'input',
    usage: {
      scenes: ['表单边框', '未选中控件背景', '暗色输入底色'],
      components: ['Input', 'Textarea', 'SelectTrigger', 'Checkbox', 'RadioGroupItem', 'Switch unchecked'],
    },
  },
  {
    name: 'ring',
    usage: {
      scenes: ['焦点环', '键盘导航描边', '选中强调描边'],
      components: ['Button', 'Input', 'SelectTrigger', 'Toggle', 'Checkbox', 'RadioGroupItem'],
    },
  },
  {
    name: 'sidebar',
    usage: {
      scenes: ['侧边栏背景', '侧边导航画布'],
      components: ['Sidebar', 'AppLayout Sidebar'],
    },
  },
  {
    name: 'sidebar-foreground',
    usage: {
      scenes: ['侧边栏默认文字', '侧边栏图标'],
      components: ['Sidebar', 'SidebarMenuButton'],
    },
  },
  {
    name: 'sidebar-primary',
    usage: {
      scenes: ['侧边栏主要操作', '侧边栏品牌/选中强调'],
      components: ['SidebarMenuButton active', 'SidebarRail', 'SidebarTrigger'],
    },
  },
  {
    name: 'sidebar-primary-foreground',
    usage: {
      scenes: ['侧边栏主色背景上的文字', '侧边栏选中项文字'],
      components: ['SidebarMenuButton active', 'SidebarTrigger'],
    },
  },
  {
    name: 'sidebar-accent',
    usage: {
      scenes: ['侧边栏悬停背景', '侧边栏激活辅助背景'],
      components: ['SidebarMenuButton hover', 'SidebarGroupAction hover'],
    },
  },
  {
    name: 'sidebar-accent-foreground',
    usage: {
      scenes: ['侧边栏悬停文字', '侧边栏辅助激活文字'],
      components: ['SidebarMenuButton hover', 'SidebarGroupAction hover'],
    },
  },
  {
    name: 'sidebar-border',
    usage: {
      scenes: ['侧边栏边框', '侧边栏分割线', '侧边栏调整手柄'],
      components: ['Sidebar', 'SidebarSeparator', 'AppLayout resize handle'],
    },
  },
  {
    name: 'sidebar-ring',
    usage: {
      scenes: ['侧边栏焦点环', '侧边栏键盘导航描边'],
      components: ['SidebarMenuButton', 'SidebarTrigger', 'AppLayout resize handle'],
    },
  },
  {
    name: 'chart-1',
    usage: {
      scenes: ['图表序列 1', '主指标数据'],
      components: ['Chart', 'ChartTooltipContent'],
    },
  },
  {
    name: 'chart-2',
    usage: {
      scenes: ['图表序列 2', '对比指标数据'],
      components: ['Chart', 'ChartTooltipContent'],
    },
  },
  {
    name: 'chart-3',
    usage: {
      scenes: ['图表序列 3', '辅助指标数据'],
      components: ['Chart', 'ChartTooltipContent'],
    },
  },
  {
    name: 'chart-4',
    usage: {
      scenes: ['图表序列 4', '补充指标数据'],
      components: ['Chart', 'ChartTooltipContent'],
    },
  },
  {
    name: 'chart-5',
    usage: {
      scenes: ['图表序列 5', '扩展指标数据'],
      components: ['Chart', 'ChartTooltipContent'],
    },
  },
] satisfies ColorInfo[]

interface CssStyleValueParser {
  parse: (property: string, cssText: string) => { toString: () => string }
}

let colorProbe: HTMLSpanElement | null = null

export function getCssVarName(name: string): string {
  return `--${name}`
}

export function readThemeColorValues(colorInfos: ColorInfo[]): Record<string, ColorValue> {
  const rootStyles = getComputedStyle(document.documentElement)

  return Object.fromEntries(colorInfos.map(({ name }) => {
    const variable = getCssVarName(name)
    const raw = rootStyles.getPropertyValue(variable).trim()

    return [name, {
      variable,
      raw: raw || '未定义',
      resolved: resolveCssColor(raw),
    } satisfies ColorValue]
  }))
}

export function disposeColorResolver(): void {
  colorProbe?.remove()
  colorProbe = null
}

function resolveCssColor(cssColor: string): string {
  if (!cssColor) {
    return '—'
  }

  const parsedColor = parseWithTypedOm(cssColor)
  if (parsedColor) {
    return parsedColor
  }

  if (typeof CSS !== 'undefined' && !CSS.supports('color', cssColor)) {
    return '不支持'
  }

  return resolveWithComputedStyle(cssColor)
}

function parseWithTypedOm(cssColor: string): string {
  const cssStyleValue = (globalThis as typeof globalThis & { CSSStyleValue?: CssStyleValueParser }).CSSStyleValue

  try {
    return cssStyleValue?.parse('color', cssColor).toString() ?? ''
  }
  catch {
    return ''
  }
}

function resolveWithComputedStyle(cssColor: string): string {
  const probe = getColorProbe()
  probe.style.color = ''
  probe.style.color = cssColor

  if (!probe.style.color) {
    return '不支持'
  }

  return getComputedStyle(probe).color.trim() || cssColor
}

function getColorProbe(): HTMLSpanElement {
  if (colorProbe) {
    return colorProbe
  }

  colorProbe = document.createElement('span')
  colorProbe.setAttribute('aria-hidden', 'true')
  colorProbe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;'
  document.body.appendChild(colorProbe)

  return colorProbe
}
