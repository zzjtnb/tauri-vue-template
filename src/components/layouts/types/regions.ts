/**
 * 布局区域元数据。
 *
 * 这里是 header/sidebar/content/footer 子区映射的唯一事实来源：
 * - public.ts 派生公共区域类型；
 * - utils/layout.ts 通过同一份常量合并区域声明；
 * - 配置字段 `all` 通过同一份映射批量填充所有子区。
 */

// 所有区域配置对象共享的基础字段；用于运行时从复合区域对象中提取整区自身配置。
export const areaKeys = ['mode', 'component', 'class', 'label', 'addons'] as const

export const regionParts = {
  // 顶部栏子区：起始区、品牌区、导航区、操作区。
  header: ['left', 'brand', 'center', 'right'],
  // 侧边栏子区：头部、内容、底部。
  sidebar: ['header', 'content', 'footer'],
  // 内容区子区：主内容前置和后置附加区。
  content: ['before', 'after'],
  // 底部栏子区：左区、中区、右区。
  footer: ['left', 'center', 'right'],
} as const

export type RegionName = keyof typeof regionParts
export type RegionPart<TName extends RegionName> = typeof regionParts[TName][number]

export const extraKeys = {
  // all 属于所有复合区域的批量子区配置；默认设置入口由 layout.settings 控制。
  header: ['all'],
  sidebar: ['all'],
  content: ['all'],
  footer: ['all'],
} as const satisfies Record<RegionName, readonly string[]>
