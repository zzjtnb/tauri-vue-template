/**
 * 主题配置模块
 * 使用工厂函数生成变体，减少重复代码
 */

import type { Theme, ThemeColorConfig } from './types'

/** 变体标签 */
const VARIANT_LABELS = {
  dark: '深色 Dark',
  light: '浅色 Light',
  soft: '柔和 Soft',
} as const

/** 月白色 (浅色模式通用背景) */
const MOON_WHITE = '#F5F8FA'

/**
 * 主题基础配置
 * 每个主题只需定义：主色、深色背景、柔和背景、文字色调整
 */
interface ThemeBase {
  label: string
  colorName: string
  /** 主色 (圆形/箭头/线条共用) */
  primary: string
  /** 深色模式背景 */
  darkBg: string
  /** 柔和模式背景 */
  softBg: string
  /** 深色模式文字色 (比主色更亮) */
  darkText: string
  /** 浅色模式文字色 (比主色更深) */
  lightText: string
  /** 柔和模式主色 (可选，默认同 primary) */
  softPrimary?: string
  /** 柔和模式文字色 */
  softText: string
  /** 浅色模式主色覆盖 (用于 mono 等特殊主题) */
  lightPrimary?: string
}

/**
 * 从基础配置生成完整主题
 */
function createTheme(base: ThemeBase): Theme {
  const { primary, softPrimary = primary, lightPrimary = primary } = base

  const createVariant = (
    id: string,
    label: string,
    bg: string,
    color: string,
    text: string,
  ) => ({
    id,
    label,
    config: {
      backgroundFill: bg,
      circleStroke: color,
      arrowFill: color,
      lineStroke: color,
      textFill: text,
    } as ThemeColorConfig,
  })

  return {
    label: base.label,
    colorName: base.colorName,
    variants: [
      createVariant('soft', VARIANT_LABELS.soft, base.softBg, softPrimary, base.softText),
      createVariant('dark', VARIANT_LABELS.dark, base.darkBg, primary, base.darkText),
      createVariant('light', VARIANT_LABELS.light, MOON_WHITE, lightPrimary, base.lightText),
    ],
  }
}

/** 主题配置表 (红橙黄绿青蓝紫 + 黑白) */
export const LOGO_THEMES: Record<string, Theme> = {
  blue: createTheme({
    label: '星空 Stellar',
    colorName: '蓝色',
    primary: '#348FF9',
    darkBg: '#000A1A',
    softBg: '#E8F2FF',
    darkText: '#48A0F8',
    lightText: '#3088F0',
    softText: '#3890F0',
  }),

  red: createTheme({
    label: '烈焰 Blaze',
    colorName: '红色',
    primary: '#FF4040',
    darkBg: '#1A0505',
    softBg: '#FFF0F0',
    darkText: '#FF5858',
    lightText: '#FF3030',
    softPrimary: '#FF5050',
    softText: '#FF4040',
  }),

  orange: createTheme({
    label: '熔岩 Lava',
    colorName: '橙色',
    primary: '#FF8800',
    darkBg: '#1A0C00',
    softBg: '#FFF5E8',
    darkText: '#FFA040',
    lightText: '#FF7000',
    softPrimary: '#FF9020',
    softText: '#FF8010',
  }),

  yellow: createTheme({
    label: '闪耀 Flash',
    colorName: '黄色',
    primary: '#FFD000',
    darkBg: '#1A1500',
    softBg: '#FFFBE8',
    darkText: '#FFDD50',
    lightText: '#E8B000',
    softPrimary: '#F0C800',
    softText: '#E8C000',
  }),

  green: createTheme({
    label: '翠影 Verdant',
    colorName: '绿色',
    primary: '#00E85C',
    darkBg: '#001A0D',
    softBg: '#E8FFF2',
    darkText: '#30F080',
    lightText: '#00C048',
    softPrimary: '#00DD58',
    softText: '#00D050',
  }),

  cyan: createTheme({
    label: '蒂芙尼 Tiffany',
    colorName: '青色',
    primary: '#40E0D0',
    darkBg: '#001A1A',
    softBg: '#E8FFFC',
    darkText: '#50E8D8',
    lightText: '#18B8A8',
    softPrimary: '#28D8C8',
    softText: '#20C8B8',
  }),

  purple: createTheme({
    label: '极光 Aurora',
    colorName: '紫色',
    primary: '#A855F7',
    darkBg: '#0D001A',
    softBg: '#F5E8FF',
    darkText: '#B068F8',
    lightText: '#9838E8',
    softPrimary: '#A850F5',
    softText: '#A048F0',
  }),

  mono: createTheme({
    label: '水墨 Ink',
    colorName: '黑白',
    primary: '#F5F8FA',
    darkBg: '#0A0A0A',
    softBg: '#EAEFF2',
    darkText: '#F5F8FA',
    lightText: '#1A1A1A',
    lightPrimary: '#1A1A1A', // 浅色模式使用深色
    softPrimary: '#2A2A2A',
    softText: '#2A2A2A',
  }),
}
