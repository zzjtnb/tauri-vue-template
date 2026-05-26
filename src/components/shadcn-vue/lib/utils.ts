import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
/**
 * 合并 class 名称的工具函
 * 用于组合 UnoCSS 工具类和组件类名
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
