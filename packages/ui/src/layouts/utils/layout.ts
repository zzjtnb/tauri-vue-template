import type {
  AreaMode,
  ResolvedAddon,
  ResolvedArea,
  ResolvedContent,
  ResolvedFooter,
  ResolvedHeader,
  ResolvedLayout,
  ResolvedSidebar,
} from '../types/internal'
import type { Layout } from '../types/public'
import type { RegionName, RegionPart } from '../types/regions'
import SettingsTrigger from '../components/common/settings/Trigger.vue'
import { areaKeys, extraKeys, regionParts } from '../types/regions'

function area(label: string, mode: AreaMode = 'default'): ResolvedArea {
  return {
    mode,
    label,
    addons: emptyAddons(),
  }
}

function emptyAddons(): ResolvedArea['addons'] {
  return {
    before: [],
    after: [],
  }
}

function settingsConfig(input?: Layout['Settings']['TriggerDeclaration']): Layout['Settings']['Trigger'] | undefined {
  if (!input || input === true) {
    return undefined
  }

  return typeof input === 'string' ? { to: input } : input
}

function settingsAddon(config?: Layout['Settings']['Trigger']): ResolvedAddon {
  return {
    component: SettingsTrigger,
    label: '默认布局设置入口',
    props: config ? { ...config } : undefined,
  }
}

function isSettingsAddon(addon: ResolvedAddon): boolean {
  return addon.component === SettingsTrigger && addon.label === '默认布局设置入口'
}

function withoutSettings<T extends ResolvedHeader>(header: T): T {
  return {
    ...header,
    right: {
      ...header.right,
      addons: {
        before: header.right.addons.before,
        after: header.right.addons.after.filter(addon => !isSettingsAddon(addon)),
      },
    },
  }
}

function withSettings<T extends ResolvedHeader>(header: T, settings?: Layout['Settings']['TriggerDeclaration']): T {
  const config = settingsConfig(settings)
  const resolvedHeader = withoutSettings(header)

  return {
    ...resolvedHeader,
    right: {
      ...resolvedHeader.right,
      addons: {
        before: resolvedHeader.right.addons.before,
        after: [...resolvedHeader.right.addons.after, settingsAddon(config)],
      },
    },
  }
}

function defaultHeader(mode: AreaMode): ResolvedHeader {
  return {
    ...area('应用顶部栏', mode),
    left: area('顶部栏起始区'),
    brand: area('顶部栏品牌区'),
    center: area('顶部栏导航区'),
    right: area('顶部栏操作区'),
  }
}

function defaultSidebar(mode: AreaMode): ResolvedSidebar {
  return {
    ...area('应用侧边栏', mode),
    header: area('侧边栏头部'),
    content: area('侧边栏内容'),
    footer: area('侧边栏底部', 'auto'),
  }
}

function defaultContent(mode: AreaMode): ResolvedContent {
  return {
    ...area('页面内容', mode),
    before: area('内容前置区', 'auto'),
    after: area('内容后置区', 'auto'),
  }
}

function defaultFooter(mode: AreaMode): ResolvedFooter {
  return {
    ...area('应用底部栏', mode),
    left: area('底部栏左区'),
    center: area('底部栏中区'),
    right: area('底部栏右区'),
  }
}

function defaultLayout(name: Layout['Name']): ResolvedLayout {
  if (name === 'blank') {
    return {
      name,
      header: defaultHeader(false),
      sidebar: defaultSidebar(false),
      content: defaultContent('default'),
      footer: defaultFooter(false),
    }
  }

  return {
    name,
    header: defaultHeader('default'),
    sidebar: defaultSidebar('default'),
    content: defaultContent('default'),
    footer: defaultFooter('auto'),
  }
}

function isLayoutConfig(input: Layout['Declaration'] | undefined): input is Layout['Config'] {
  return Boolean(input && typeof input === 'object' && 'name' in input)
}

function withLayoutPreference(input: Layout['Declaration'] | undefined, name: Exclude<Layout['Name'], 'blank'>): Layout['Declaration'] {
  return isLayoutConfig(input) ? { ...input, name } : name
}

function isAreaMode(input: unknown): input is Layout['Area']['Mode'] {
  return input === false || input === 'default' || input === 'custom' || input === 'auto'
}

function addon(input: Layout['Area']['Addon']): ResolvedAddon {
  return {
    component: input.component,
    props: input.props,
    class: input.class,
    label: input.label,
  }
}

function addonList(input: Layout['Area']['AddonInput'] | undefined, fallback: ResolvedAddon[]): ResolvedAddon[] {
  if (input === undefined) {
    return fallback.map(item => ({ ...item }))
  }
  if (input === false) {
    return []
  }

  const addons = Array.isArray(input) ? input : [input]
  return addons.map(addon)
}

function mergeAddons(base: ResolvedArea['addons'], override: Layout['Area']['Config']['addons']): ResolvedArea['addons'] {
  if (!override) {
    return {
      before: base.before.map(item => ({ ...item })),
      after: base.after.map(item => ({ ...item })),
    }
  }

  return {
    before: addonList(override.before, base.before),
    after: addonList(override.after, base.after),
  }
}

interface RegionExtra {
  all?: Layout['Area']['Declaration']
}
type RegionConfig<TName extends RegionName> = Layout['Area']['Config'] & RegionExtra & Partial<Record<RegionPart<TName>, Layout['Area']['Declaration']>>
type ResolvedRegion<TName extends RegionName> = ResolvedArea & Record<RegionPart<TName>, ResolvedArea>

function hasKey(input: unknown, keys: readonly string[]): input is Record<string, unknown> {
  return Boolean(input && typeof input === 'object' && keys.some(key => key in input))
}

function isAreaConfig(input: unknown): input is Layout['Area']['Config'] {
  return hasKey(input, areaKeys)
}

function isRegionConfig<TName extends RegionName>(input: unknown, name: TName): input is RegionConfig<TName> {
  if (!input || typeof input !== 'object') {
    return false
  }

  return Object.keys(input).length === 0
    || isAreaConfig(input)
    || hasKey(input, regionParts[name])
    || hasKey(input, extraKeys[name])
}

/**
 * 提取整区自身字段，丢弃 all、header.left、sidebar.content、footer.center 等子区字段。
 * 这样 `footer: { all, left, right }` 不会被误判为“整个 footer 区域配置”，子区仍由 mergeRegion 统一处理。
 */
function areaBase(input: Layout['Area']['Config'] | undefined): Layout['Area']['Config'] | undefined {
  if (!input) {
    return undefined
  }

  const config: Layout['Area']['Config'] = {}
  for (const key of areaKeys) {
    if (input[key] !== undefined) {
      config[key] = input[key] as never
    }
  }

  return Object.keys(config).length > 0 ? config : undefined
}

/**
 * 转换 header/sidebar/content/footer 整区声明。
 * 所有整区都支持 false/default/custom/auto 或完整配置对象；完整配置对象中的子区字段不会污染整区自身配置。
 */
function toRegionBase<TName extends RegionName>(input: unknown, name: TName): Layout['Area']['Declaration'] | undefined {
  if (input === undefined || isAreaMode(input)) {
    return input
  }

  return isRegionConfig(input, name) ? areaBase(input) : undefined
}

/**
 * 转换单个区域声明：模式值转为 { mode }，配置对象直接参与合并。
 * route meta、areas 注册表和子区配置都会经过这里，保证后续合并逻辑只面对结构化配置。
 */
function toAreaConfig(input: Layout['Area']['Declaration'] | undefined): Layout['Area']['Config'] | undefined {
  if (input === undefined) {
    return undefined
  }
  if (isAreaMode(input)) {
    return { mode: input }
  }
  return isAreaConfig(input) ? input : undefined
}

function mergeArea<T extends ResolvedArea>(base: T, override: Layout['Area']['Declaration'] | undefined): T {
  if (override === undefined) {
    return { ...base }
  }
  if (override === false) {
    return {
      ...base,
      mode: false,
      component: undefined,
      addons: emptyAddons(),
    }
  }

  const config = toAreaConfig(override)

  return {
    ...base,
    mode: config?.mode ?? (config?.component ? 'custom' : base.mode),
    component: config?.component ?? base.component,
    class: config?.class ?? base.class,
    label: config?.label ?? base.label,
    addons: mergeAddons(base.addons, config?.addons),
  }
}

/**
 * 合并复合区域：先合并整区 mode/component/class/label/addons，再按子区列表合并各子区。
 * header/sidebar/content/footer 共享这一个入口，避免四套近似 merge 逻辑漂移。
 */
function mergeRegion<TName extends RegionName, TRegion extends ResolvedRegion<TName>>(base: TRegion, override: unknown, name: TName): TRegion {
  const region = mergeArea(base, toRegionBase(override, name))
  if (!isRegionConfig(override, name)) {
    return region
  }

  const parts = regionParts[name] as readonly RegionPart<TName>[]
  const merged = { ...region } as TRegion
  const mergedParts = merged as Record<RegionPart<TName>, ResolvedArea>
  const baseParts = base as Record<RegionPart<TName>, ResolvedArea>
  const overrideParts = override as RegionConfig<TName>

  for (const part of parts) {
    mergedParts[part] = mergeArea(baseParts[part], overrideParts[part] ?? overrideParts.all)
  }

  return merged
}

function mergeHeader(base: ResolvedHeader, override: Layout['Header']['Declaration'] | undefined): ResolvedHeader {
  return mergeRegion(base, override, 'header')
}

function applySettings(layout: ResolvedLayout, settings?: Layout['Settings']['TriggerDeclaration']): ResolvedLayout {
  if (layout.header.mode === false || settings === false) {
    return {
      ...layout,
      header: withoutSettings(layout.header),
    }
  }

  return {
    ...layout,
    header: withSettings(layout.header, settings),
  }
}

/**
 * 按声明顺序合并区域预设；后面的 preset 覆盖前面的同级区域。
 * 缺失预设只在开发环境警告，避免远程配置或灰度路由让布局直接崩溃。
 */
function presets(areas: Layout['Config']['areas'], registry: Record<string, Layout['Area']['Preset']>): Layout['Area']['Preset'] {
  if (!areas) {
    return {}
  }

  const names = Array.isArray(areas) ? areas : [areas]
  return names.reduce<Layout['Area']['Preset']>((merged, name) => {
    const preset = registry[name]
    if (!preset) {
      if (import.meta.env.DEV) {
        console.warn(`[layouts] 未找到区域预设：${name}`)
      }
      return merged
    }

    return {
      settings: preset.settings === undefined ? merged.settings : preset.settings,
      header: preset.header === undefined ? merged.header : preset.header,
      sidebar: preset.sidebar === undefined ? merged.sidebar : preset.sidebar,
      content: preset.content === undefined ? merged.content : preset.content,
      footer: preset.footer === undefined ? merged.footer : preset.footer,
    }
  }, {})
}

function applyPreset(base: ResolvedLayout, preset: Layout['Area']['Preset']): ResolvedLayout {
  return {
    ...base,
    header: mergeHeader(base.header, preset.header),
    sidebar: mergeRegion(base.sidebar, preset.sidebar, 'sidebar'),
    content: mergeRegion(base.content, preset.content, 'content'),
    footer: mergeRegion(base.footer, preset.footer, 'footer'),
  }
}

function applyLayout(base: ResolvedLayout, layout: Layout['Config']): ResolvedLayout {
  return {
    ...base,
    name: layout.name,
    header: mergeHeader(base.header, layout.header),
    sidebar: mergeRegion(base.sidebar, layout.sidebar, 'sidebar'),
    content: mergeRegion(base.content, layout.content, 'content'),
    footer: mergeRegion(base.footer, layout.footer, 'footer'),
  }
}

function baseLayout(input: Layout['Declaration'] | undefined, registry: Record<string, Layout['Area']['Preset']>): ResolvedLayout {
  if (!input) {
    return applySettings(defaultLayout('topnav'))
  }
  if (!isLayoutConfig(input)) {
    return applySettings(defaultLayout(input))
  }

  const preset = presets(input.areas, registry)
  return applySettings(
    applyLayout(applyPreset(defaultLayout(input.name), preset), input),
    input.settings ?? preset.settings,
  )
}

/**
 * 全局布局模式只覆盖未 fixed 的标准布局页面；fixed 由 useRuntime 基于 layout.fixed 和 blank 默认规则统一传入。
 */
export function resolveLayout(input: Layout['Declaration'] | undefined, registry: Record<string, Layout['Area']['Preset']>, overrideName: Exclude<Layout['Name'], 'blank'> | null, fixed: boolean): ResolvedLayout {
  return overrideName && !fixed
    ? baseLayout(withLayoutPreference(input, overrideName), registry)
    : baseLayout(input, registry)
}
