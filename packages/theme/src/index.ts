/**
 * theme 包总入口：加载全局样式，并导出 UnoCSS 配置工厂。
 */
import './styles/index.css'

export { createUnoConfig, default } from './unocss.ts'
export type { ThemeUnoConfigOptions } from './unocss.ts'
