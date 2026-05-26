import { inspect } from 'node:util'

/**
 * 把未知值格式化成稳定、完整、适合写入日志的调试文本。
 *
 * @param payload - 需要写入日志或错误信息的未知值。
 * @returns 去除颜色、完整展开并按 key 排序后的 inspect 文本。
 * @public
 */
export function inspectDebug(payload: unknown): string {
  return inspect(payload, {
    breakLength: 120,
    colors: false,
    compact: false,
    depth: null,
    maxArrayLength: null,
    maxStringLength: null,
    sorted: true,
  })
}
