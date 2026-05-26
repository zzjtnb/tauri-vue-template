export interface IconCollection {
  /** 受信任的 Iconify API 根地址；组件会读取集合 JSON 与单个 SVG 预览。 */
  apiBase: string
  /** 面向使用者展示的集合名称。 */
  name: string
  /** Iconify 集合前缀，同时用于输出 UnoCSS 图标类 `i-${prefix}-${name}`。 */
  prefix: string
}

export const lucideIconCollection: IconCollection = {
  apiBase: 'https://api.iconify.design',
  name: 'Lucide',
  prefix: 'lucide',
}
