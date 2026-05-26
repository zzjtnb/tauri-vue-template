/**
 * Logo 默认配置
 * 仅包含运行时配置项，不做 re-export
 */

import type { EffectOption, LogoConfig, PanelConfig } from './types'
import { DEFAULT_FONT, DEFAULT_FONT_FAMILY } from './fonts'
import { LOGO_CONSTANTS } from './logo'
import { LOGO_THEMES } from './themes'

/** 默认主题 key */
export const DEFAULT_THEME_KEY = 'blue'
/** 默认变体 ID */
export const DEFAULT_VARIANT_ID = 'soft'
/** 默认变体 index (0=soft, 1=dark, 2=light) */
const DEFAULT_VARIANT_INDEX = 0

/** 获取默认主题配置 */
const defaultThemeConfig = LOGO_THEMES[DEFAULT_THEME_KEY]!.variants[DEFAULT_VARIANT_INDEX]!.config

/** 默认 Logo 配置 (使用 blue 主题 soft 变体) */
export const defaultLogoConfig: LogoConfig = {
  width: LOGO_CONSTANTS.BASE_WIDTH,
  height: LOGO_CONSTANTS.BASE_WIDTH,
  backgroundRx: 0.222, // 约 22% 圆角 (原 240px / 1080px)
  // backgroundRx: 0,
  backgroundFill: defaultThemeConfig.backgroundFill,
  // 颜色从主题获取，保持一致性
  circleStroke: defaultThemeConfig.circleStroke,
  circleStrokeWidth: 22,
  arrowFill: defaultThemeConfig.arrowFill,
  lineStroke: defaultThemeConfig.lineStroke,
  lineStrokeWidth: 16,
  textFill: defaultThemeConfig.textFill,
  textContent: '争逐',
  fontSize: 90,
  fontWeight: DEFAULT_FONT.defaultWeight,
  fontFamily: DEFAULT_FONT_FAMILY,
  scale: 1.0,
  effects: ['hollow', 'shadow'],
}

/** 特效选项 */
export const LOGO_EFFECT_OPTIONS: EffectOption[] = [
  { value: 'hollow', label: '镂空 Hollow' },
  { value: 'shadow', label: '阴影 Shadow' },
  { value: 'glow', label: '发光 Glow' },
  { value: 'double-ring', label: '双圈 Double Ring' },
  { value: 'dashed', label: '虚线圆 Dashed' },
]

/** 配置面板 */
export const LOGO_PANELS: PanelConfig[] = [
  { title: '圆形', color: 'circleStroke', width: 'circleStrokeWidth', colorId: 'circle-stroke', widthId: 'circle-width' },
  { title: '箭锋', color: 'arrowFill', colorId: 'arrow-fill' },
  { title: '平衡线条', color: 'lineStroke', width: 'lineStrokeWidth', colorId: 'line-stroke', widthId: 'line-width' },
]
