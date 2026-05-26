// ==================== 主题页面类型 ====================

/** 颜色使用说明 */
export interface ColorUsage {
  scenes: string[]
  components: string[]
}

/** 颜色信息 */
export interface ColorInfo {
  name: string
  usage: ColorUsage
}

/** 颜色值 */
export interface ColorValue {
  variable: string
  raw: string
  resolved: string
}
