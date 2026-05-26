/**
 * Logo 导出模块
 *
 * 提供多种格式的 Logo 导出功能:
 * - SVG: 矢量格式，可无损缩放
 * - PNG: 位图格式，动态分辨率确保高清
 * - ICO: Windows 图标格式，支持多尺寸打包
 */

import type { LogoConfig, OutlineConfig } from './types'
import JSZip from 'jszip'
import Session from 'svg-text-to-path'
import { LOGO_FONTS } from './fonts'
import { calculateScaleForSize, generateSvg } from './logo'

// ==================== 导出尺寸配置 ====================

/** 导出尺寸选项 (用于 PNG 单独导出) */
export const EXPORT_SIZE_OPTIONS = [
  { value: 16, label: '16×16', description: '浏览器标签页' },
  { value: 32, label: '32×32', description: '任务栏/高清标签' },
  { value: 64, label: '64×64', description: '高 DPI Windows' },
  { value: 128, label: '128×128', description: '小型预览图' },
  { value: 180, label: '180×180', description: 'iOS Apple Touch Icon' },
  { value: 192, label: '192×192', description: 'Android Chrome' },
  { value: 256, label: '256×256', description: '中型图标' },
  { value: 512, label: '512×512', description: 'PWA 启动图标' },
  { value: 1024, label: '1024×1024', description: '高清大图' },
] as const

/** Favicon ICO 包含的尺寸 (传统 .ico 格式) */
export const FAVICON_ICO_SIZES = [
  { value: 16, label: '16×16', description: '浏览器标签页 (必须)' },
  { value: 32, label: '32×32', description: '任务栏/高清标签' },
  { value: 48, label: '48×48', description: 'Windows 快捷方式' },
  { value: 64, label: '64×64', description: '高 DPI Windows' },
] as const

// ==================== 转曲配置 ====================

/** 默认转曲配置 */
export const defaultOutlineConfig: OutlineConfig = {
  enabled: true,
  decimals: 2,
  textAttr: '',
  keepFontAttrs: false,
  noFontAction: 'error',
}

/** noFontAction 选项 */
export const NO_FONT_ACTION_OPTIONS = [
  { value: 'error', label: '抛出错误', description: '严格模式，找不到字体时停止' },
  { value: 'skipNode', label: '跳过节点', description: '跳过整个 text 节点' },
  { value: 'skipChar', label: '跳过字符', description: '仅跳过缺失的字符' },
] as const

// ==================== 字体缓存 ====================

/** 字体缓存实例 (10 分钟过期) */
let fontCache: ReturnType<typeof Session.prototype.createCache> | null = null

function getFontCache() {
  if (!fontCache) {
    fontCache = new Session('', {}).createCache(10 * 60 * 1000)
  }
  return fontCache
}

// ==================== 基础工具函数 ====================

/**
 * 将 SVG 中的 text 元素转换为 path（转曲）
 * 使用 svg-text-to-path 库的 ConfigProvider 方式
 */
export async function convertTextToPath(
  svgContent: string,
  logoConfig: LogoConfig,
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<string> {
  const config = { ...defaultOutlineConfig, ...outlineConfig }
  const fontFamily = logoConfig.fontFamily
  const fontConfig = LOGO_FONTS[fontFamily]

  if (!fontConfig) {
    throw new Error(`字体 "${fontFamily}" 未在 LOGO_FONTS 中配置`)
  }

  const session = new Session(svgContent, {
    fontCache: getFontCache(),
    decimals: config.decimals,
    textAttr: config.textAttr || undefined,
    keepFontAttrs: config.keepFontAttrs,
    noFontAction: config.noFontAction === 'skipChar' ? '' : config.noFontAction,
    fonts: { [fontFamily]: fontConfig.sources },
  })

  const stats = await session.replaceAll()
  const result = session.getSvgString()
  session.destroy()

  if (config.noFontAction === 'error' && stats.errors > 0) {
    throw new Error(`转曲失败: ${stats.errors} 个文字节点无法转换`)
  }

  return result
}

/** 触发浏览器文件下载 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  }).click()
  URL.revokeObjectURL(url)
}

// ==================== 格式转换 ====================

/**
 * 将 SVG 转换为 PNG Blob
 * 小图标使用更高像素比例以保持清晰
 */
export async function svgToPngBlob(svgData: string, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // 动态计算像素比例：确保最小渲染分辨率为 256px
      const pixelRatio = size < 256 ? Math.ceil(256 / size) : 1
      canvas.width = size * pixelRatio
      canvas.height = size * pixelRatio

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.scale(pixelRatio, pixelRatio)
      ctx.drawImage(img, 0, 0, size, size)

      canvas.toBlob((blob) => {
        if (blob)
          resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/png')
    }
    img.onerror = reject
  })
}

/**
 * 创建 ICO 格式 Blob
 * ICO 文件结构: Header (6 bytes) + Directory Entries (16 bytes each) + Image Data
 */
export function createIcoBlob(pngBuffers: ArrayBuffer[], sizes: number[]): Blob {
  const numImages = pngBuffers.length
  const headerSize = 6
  const dirEntrySize = 16

  let dataOffset = headerSize + dirEntrySize * numImages
  const offsets: number[] = []

  for (const buffer of pngBuffers) {
    offsets.push(dataOffset)
    dataOffset += buffer.byteLength
  }

  const totalSize = dataOffset
  const icoBuffer = new ArrayBuffer(totalSize)
  const view = new DataView(icoBuffer)
  const uint8 = new Uint8Array(icoBuffer)

  // ICO Header
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, numImages, true)

  // Directory Entries
  let entryOffset = headerSize
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i]!
    const pngBuffer = pngBuffers[i]!
    const pngSize = pngBuffer.byteLength

    view.setUint8(entryOffset, size < 256 ? size : 0)
    view.setUint8(entryOffset + 1, size < 256 ? size : 0)
    view.setUint8(entryOffset + 2, 0)
    view.setUint8(entryOffset + 3, 0)
    view.setUint16(entryOffset + 4, 1, true)
    view.setUint16(entryOffset + 6, 32, true)
    view.setUint32(entryOffset + 8, pngSize, true)
    view.setUint32(entryOffset + 12, offsets[i]!, true)

    entryOffset += dirEntrySize
  }

  // Image Data
  for (let i = 0; i < numImages; i++) {
    uint8.set(new Uint8Array(pngBuffers[i]!), offsets[i]!)
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' })
}

// ==================== 下载函数 ====================

/** 下载 SVG 文件 */
export function downloadSvg(svgContent: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  triggerDownload(blob, 'logo.svg')
}

/** 生成用于位图导出的 SVG（支持转曲） */
async function generateSvgForBitmap(
  logoConfig: LogoConfig,
  size: number,
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<string> {
  const finalScale = calculateScaleForSize(size, logoConfig.scale)
  const tempConfig = { ...logoConfig, width: size, height: size }

  let svgData = generateSvg(tempConfig, finalScale)

  const config = { ...defaultOutlineConfig, ...outlineConfig }
  if (config.enabled) {
    svgData = await convertTextToPath(svgData, logoConfig, config)
  }

  return svgData
}

/** 下载 PNG 文件 (单个尺寸) */
export async function downloadPng(
  logoConfig: LogoConfig,
  size: number,
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<void> {
  const svgData = await generateSvgForBitmap(logoConfig, size, outlineConfig)
  const blob = await svgToPngBlob(svgData, size)
  triggerDownload(blob, `logo-${size}x${size}.png`)
}

/** 下载 ICO 文件 (单个尺寸) */
export async function downloadIco(
  logoConfig: LogoConfig,
  size: number,
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<void> {
  const svgData = await generateSvgForBitmap(logoConfig, size, outlineConfig)
  const blob = await svgToPngBlob(svgData, size)
  const buffer = await blob.arrayBuffer()
  const icoBlob = createIcoBlob([buffer], [size])
  triggerDownload(icoBlob, `favicon-${size}.ico`)
}

/** 批量下载 PNG 文件 (打包成 ZIP) */
export async function downloadPngBatch(
  logoConfig: LogoConfig,
  sizes: readonly number[],
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<void> {
  const zip = new JSZip()

  const results = await Promise.all(
    sizes.map(async (size) => {
      const svgData = await generateSvgForBitmap(logoConfig, size, outlineConfig)
      const blob = await svgToPngBlob(svgData, size)
      return { size, blob }
    }),
  )

  for (const { size, blob } of results) {
    zip.file(`logo-${size}x${size}.png`, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(zipBlob, 'logo-png.zip')
}

/** 批量下载 ICO 文件 (所有尺寸打包成单个文件) */
export async function downloadIcoBatch(
  logoConfig: LogoConfig,
  sizes: readonly number[],
  outlineConfig: Partial<OutlineConfig> = {},
): Promise<void> {
  const results = await Promise.all(
    sizes.map(async (size) => {
      const svgData = await generateSvgForBitmap(logoConfig, size, outlineConfig)
      const blob = await svgToPngBlob(svgData, size)
      const buffer = await blob.arrayBuffer()
      return { size, buffer }
    }),
  )

  const pngDataArray = results.map(r => r.buffer)
  const icoBlob = createIcoBlob(pngDataArray, sizes as number[])
  triggerDownload(icoBlob, 'favicon.ico')
}
