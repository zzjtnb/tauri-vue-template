// ==================== 字体配置类型 ====================

/** 字体源配置 (对应 svg-text-to-path 的 FontSource) */
export interface FontSource {
  /** 字重: 固定值或范围 [min, max] */
  wght?: number | [number, number]
  /** 斜体 */
  ital?: number
  /** 字宽: 固定值或范围 [min, max] */
  wdth?: number | [number, number]
  /** 字体文件 URL (转曲时自动加载) */
  source: string
}

/** 字体配置 */
export interface FontConfig {
  /** 显示名称（用于 UI） */
  label: string
  /** 字体源列表 (支持多字重/可变字体) */
  sources: FontSource[]
  /** 默认字重 */
  defaultWeight: number
}

// ==================== Logo 配置类型 ====================

/** Logo 特效类型 */
export type LogoEffect = 'hollow' | 'shadow' | 'glow' | 'double-ring' | 'dashed'

/** Logo 配置参数 */
export interface LogoConfig {
  /** SVG 宽度（像素） */
  width: number
  /** SVG 高度（像素） */
  height: number
  /** 背景圆角比例（0=方形, 0.5=圆形），实际 rx = ratio * min(width, height) */
  backgroundRx: number
  /** 背景颜色（十六进制颜色值） */
  backgroundFill: string
  /** 圆形边框颜色 */
  circleStroke: string
  /** 圆形边框宽度（像素） */
  circleStrokeWidth: number
  /** 箭头填充颜色 */
  arrowFill: string
  /** 平衡线条颜色 */
  lineStroke: string
  /** 平衡线条宽度（像素） */
  lineStrokeWidth: number
  /** 文字颜色 */
  textFill: string
  /** 文字内容 */
  textContent: string
  /** 文字大小（像素） */
  fontSize: number
  /** 文字字重（100-900） */
  fontWeight: number
  /** 字体家族 */
  fontFamily: string
  /** Logo 整体缩放比例（1.0 为原始大小） */
  scale: number
  /** 特效列表 */
  effects: LogoEffect[]
}

// ==================== 主题类型 ====================

/** 主题颜色配置（从 LogoConfig 派生的颜色字段子集） */
export type ThemeColorConfig = Pick<LogoConfig, 'backgroundFill' | 'circleStroke' | 'arrowFill' | 'lineStroke' | 'textFill'>

/** 主题变体配置 */
export interface ThemeVariant {
  id: string
  label: string
  config: ThemeColorConfig
}

/** 主题配置 */
export interface Theme {
  label: string
  colorName: string
  variants: ThemeVariant[]
}

// ==================== UI 配置类型 ====================

/** 特效选项（类型安全版本） */
export interface EffectOption {
  value: LogoEffect
  label: string
}

/** Logo 颜色字段键 */
export type LogoColorKey = 'backgroundFill' | 'circleStroke' | 'arrowFill' | 'lineStroke' | 'textFill'

/** Logo 宽度字段键 */
export type LogoWidthKey = 'circleStrokeWidth' | 'lineStrokeWidth'

/** 面板配置 */
export interface PanelConfig {
  title: string
  color: LogoColorKey
  width?: LogoWidthKey
  colorId: string
  widthId?: string
}

// ==================== SVG 生成选项 ====================

/** SVG 生成选项 */
export interface SvgGenerateOptions {
  /** 使用 currentColor 替代具体颜色值（用于可复用组件） */
  useCurrentColor?: boolean
  /** 添加使用说明注释 */
  includeUsageComment?: boolean
}

// ==================== 转曲导出配置 ====================

/** 找不到字体时的处理方式 */
export type NoFontAction = 'skipNode' | 'error' | 'skipChar'

/** 转曲导出配置 */
export interface OutlineConfig {
  /** 是否启用转曲 */
  enabled: boolean
  /** 路径坐标小数位数 (1-6)，值越小文件越小 */
  decimals: number
  /** 保留原文字到指定属性 (如 'data-text')，空字符串表示不保留 */
  textAttr: string
  /** 保留字体属性 (font-size, letter-spacing 等) */
  keepFontAttrs: boolean
  /** 找不到字体时的处理方式 */
  noFontAction: NoFontAction
}
