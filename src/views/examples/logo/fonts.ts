/**
 * 字体配置模块
 * 字体定义 + 字体工具函数
 */

import type { FontConfig } from './types'

/**
 * Logo 可用字体配置
 * 使用 ConfigProvider 方式：sources 中指定字体文件 URL，转曲时直接加载
 */
export const LOGO_FONTS: Record<string, FontConfig> = {
  'Liu Jian Mao Cao': {
    label: '刘建毛草',
    sources: [
      { wght: 400, source: 'https://fonts.bunny.net/liu-jian-mao-cao/files/liu-jian-mao-cao-chinese-simplified-400-normal.woff2' },
    ],
    defaultWeight: 400,
  },
  'Ma Shan Zheng': {
    label: '马善政楷书',
    sources: [
      { wght: 400, source: 'https://fonts.bunny.net/ma-shan-zheng/files/ma-shan-zheng-chinese-simplified-400-normal.woff2' },
    ],
    defaultWeight: 400,
  },
}

/** 默认字体 family */
export const DEFAULT_FONT_FAMILY = Object.keys(LOGO_FONTS)[0]!

/** 默认字体配置 */
export const DEFAULT_FONT = LOGO_FONTS[DEFAULT_FONT_FAMILY]!

/**
 * 检查字体是否为可变字体
 * 可变字体的 wght 是一个范围数组 [min, max]
 */
export function isVariableFont(config: FontConfig): boolean {
  return config.sources.some(s => Array.isArray(s.wght))
}

/**
 * 获取字体支持的字重范围
 * @returns 静态字体返回字重数组，可变字体返回 [min, max]
 */
export function getFontWeightRange(config: FontConfig): number[] | [number, number] {
  const variableSource = config.sources.find(s => Array.isArray(s.wght))
  if (variableSource && Array.isArray(variableSource.wght)) {
    return variableSource.wght
  }
  return config.sources
    .filter(s => typeof s.wght === 'number')
    .map(s => s.wght as number)
}
