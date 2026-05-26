/**
 * Logo SVG 生成模块
 * 核心 SVG 生成逻辑 + scale 计算
 */

import type { LogoConfig, SvgGenerateOptions } from './types'

/**
 * Logo 设计常量
 * 集中管理魔法数值，供其他模块引用
 */
export const LOGO_CONSTANTS = {
  /** 基础画布宽度 */
  BASE_WIDTH: 1080,
  /** 基础圆半径 */
  BASE_RADIUS: 180,
  /** 视觉缩放倍率: 将 scale=1.0 放大 2.5 倍以获得约 85% 的饱满占比 */
  VISUAL_SCALE_MULTIPLIER: 2.5,
  /** 文字垂直居中几何基线: (CircleBottom 180 + ArrowBottom 20) / 2 */
  TEXT_BASELINE_GEOMETRIC: 100,
  /** 文字光学修正: 上移 5px 以抵消视觉下坠感 */
  TEXT_OPTICAL_OFFSET: -5,
  /** 双圈效果外圈额外半径 */
  OUTER_RING_OFFSET: 20,
  /** 箭头路径 (相对于圆心) */
  ARROW_PATH: 'M0,-150 L35,20 L0,0 L-35,20 Z',
  /** 平衡线条坐标 */
  LINE_COORDS: {
    LEFT_START: -155,
    LEFT_END: -70,
    RIGHT_START: 70,
    RIGHT_END: 155,
    Y: 0,
  },
} as const

/**
 * 计算文字基线 Y 坐标
 * @param fontSize 字体大小
 */
function calculateTextY(fontSize: number): number {
  const { TEXT_BASELINE_GEOMETRIC, TEXT_OPTICAL_OFFSET } = LOGO_CONSTANTS
  return (TEXT_BASELINE_GEOMETRIC + TEXT_OPTICAL_OFFSET) + fontSize * 0.3
}

/** 生成虚线参数 */
function generateDashedParams(radius: number, dashCount = 24, dashRatio = 2): string {
  const circumference = 2 * Math.PI * radius
  const unit = circumference / (dashCount * (dashRatio + 1))
  const dash = (unit * dashRatio).toFixed(2)
  const gap = unit.toFixed(2)
  return `stroke-dasharray="${dash} ${gap}"`
}

/**
 * 计算最终缩放比例
 * @param config Logo 配置
 */
export function calculateFinalScale(config: LogoConfig): number {
  const { BASE_WIDTH, VISUAL_SCALE_MULTIPLIER } = LOGO_CONSTANTS
  const baseScale = Math.min(config.width, config.height) / BASE_WIDTH
  return config.scale * baseScale * VISUAL_SCALE_MULTIPLIER
}

/**
 * 根据尺寸计算缩放比例 (用于导出)
 * @param size 目标尺寸
 * @param scale Logo 缩放系数
 */
export function calculateScaleForSize(size: number, scale: number): number {
  const { BASE_WIDTH, VISUAL_SCALE_MULTIPLIER } = LOGO_CONSTANTS
  const baseScale = size / BASE_WIDTH
  return scale * baseScale * VISUAL_SCALE_MULTIPLIER
}

/**
 * 生成 Logo SVG 字符串
 * @param config Logo 配置
 * @param finalScale 最终缩放比例
 * @param options 生成选项
 */
export function generateSvg(config: LogoConfig, finalScale: number, options: SvgGenerateOptions = {}): string {
  const { useCurrentColor = false, includeUsageComment = false } = options
  const { BASE_RADIUS, OUTER_RING_OFFSET, ARROW_PATH, LINE_COORDS } = LOGO_CONSTANTS
  const center = config.width / 2

  const textY = calculateTextY(config.fontSize)
  const bgFill = config.backgroundFill === 'transparent' ? 'none' : config.backgroundFill
  // 计算实际圆角像素值：比例 * min(width, height)
  const actualRx = Math.round(config.backgroundRx * Math.min(config.width, config.height))

  // 特效标记
  const isHollow = config.effects.includes('hollow')
  const isGlow = config.effects.includes('glow')
  const isShadow = config.effects.includes('shadow')
  const isDoubleRing = config.effects.includes('double-ring')
  const isDashed = config.effects.includes('dashed')

  // 颜色值 (useCurrentColor 模式下所有颜色均使用 currentColor，可通过 CSS 统一控制)
  const circleColor = useCurrentColor ? 'currentColor' : config.circleStroke
  const arrowColor = useCurrentColor ? 'currentColor' : config.arrowFill
  const lineColor = useCurrentColor ? 'currentColor' : config.lineStroke
  const textColor = useCurrentColor ? 'currentColor' : config.textFill
  const glowColor = useCurrentColor ? 'currentColor' : config.circleStroke
  // 背景色：currentColor 模式下设为 none (透明)，因为背景通常需要独立控制
  const bgColor = useCurrentColor ? 'none' : bgFill

  // 镂空模式
  const arrowFill = isHollow ? 'none' : arrowColor
  const arrowStrokeWidth = Math.round(config.circleStrokeWidth * 0.67)
  const arrowStrokeAttr = isHollow
    ? `stroke="${arrowColor}" stroke-width="${arrowStrokeWidth}" stroke-linejoin="round" stroke-linecap="round"`
    : ''

  // 外圈
  const outerRadius = BASE_RADIUS + OUTER_RING_OFFSET
  const circleStrokeDasharray = isDashed ? generateDashedParams(BASE_RADIUS) : ''
  const outerCircleStrokeDasharray = isDashed ? generateDashedParams(outerRadius) : ''
  const outerRingStrokeWidth = Math.round(Math.max(2, config.circleStrokeWidth / 3))

  // 滤镜定义
  const filters: string[] = []
  if (isGlow) {
    filters.push(`
    <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="0" flood-color="${glowColor}" flood-opacity="1"/>
      <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="${glowColor}" flood-opacity="0.8"/>
      <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="${glowColor}" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${glowColor}" flood-opacity="0.3"/>
    </filter>`)
  }
  if (isShadow) {
    filters.push(`
    <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
    </filter>`)
  }

  const defsBlock = filters.length > 0 ? `<defs>${filters.join('')}</defs>` : ''

  // 滤镜属性
  const filterAttrs: string[] = []
  if (isGlow)
    filterAttrs.push('url(#logo-glow)')
  if (isShadow)
    filterAttrs.push('url(#logo-shadow)')
  const filterAttr = filterAttrs.length > 0 ? `filter="${filterAttrs.join(' ')}"` : ''

  // 双圈效果
  const outerRing = isDoubleRing
    ? `<circle cx="0" cy="0" r="${outerRadius}" fill="none" stroke="${circleColor}" stroke-width="${outerRingStrokeWidth}" opacity="0.5" ${outerCircleStrokeDasharray}/>`
    : ''

  // 使用说明注释（组件模式下添加，放在 SVG 内部第一行以保留转曲后）
  const usageComment = includeUsageComment
    ? `
  <!--
    Logo 图标组件 (currentColor 模式)
    圆形边框、箭头、平衡线条、文字均使用 currentColor，背景透明
    通过父元素 color 属性统一控制所有元素颜色
    使用方式：
    - Vue: <IconLogo style="color: red" /> 或 class="your-color-class"
    - HTML: <div style="color: #3b82f6">此处粘贴 SVG</div>
    - CSS: .logo { color: var(your-color-variable); }
  -->`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">${usageComment}
  ${defsBlock}
  <!-- 背景 -->
  ${(bgColor === 'none' || bgColor === 'transparent')
    ? `<!-- <rect width="${config.width}" height="${config.height}" rx="${actualRx}" ry="${actualRx}" fill="${bgColor}" /> -->`
    : `<rect width="${config.width}" height="${config.height}" rx="${actualRx}" ry="${actualRx}" fill="${bgColor}" />`}
  <!-- 主图形 -->
  <g transform="translate(${center},${center}) scale(${finalScale})" ${filterAttr}>
   <!-- 外圈 (双圈模式) -->
    ${outerRing}
    <!-- 圆形边框 -->
    <circle cx="0" cy="0" r="${BASE_RADIUS}" fill="none" stroke="${circleColor}" stroke-width="${config.circleStrokeWidth}" ${circleStrokeDasharray}/>
    <!-- 冲刺箭锋 -->
    <path d="${ARROW_PATH}" fill="${arrowFill}" ${arrowStrokeAttr}/>
    <!-- 左右平衡线条 -->
    <line x1="${LINE_COORDS.LEFT_START}" y1="${LINE_COORDS.Y}" x2="${LINE_COORDS.LEFT_END}" y2="${LINE_COORDS.Y}" stroke="${lineColor}" stroke-width="${config.lineStrokeWidth}" stroke-linecap="round"/>
    <line x1="${LINE_COORDS.RIGHT_START}" y1="${LINE_COORDS.Y}" x2="${LINE_COORDS.RIGHT_END}" y2="${LINE_COORDS.Y}" stroke="${lineColor}" stroke-width="${config.lineStrokeWidth}" stroke-linecap="round"/>
    <!-- 圆内文字 -->
    <text x="0" y="${textY}" font-size="${config.fontSize}px" fill="${textColor}" font-weight="${config.fontWeight}" text-anchor="middle" font-family="${config.fontFamily}">
      ${config.textContent}
    </text>
  </g>
</svg>`
}
