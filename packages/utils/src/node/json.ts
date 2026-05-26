import type { WriteJsonOptions } from './types.ts'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { ensureDir, writeTextIfChanged } from './fs.ts'

/**
 * 读取并解析 JSON 文件。
 *
 * @template TResult 解析后的目标类型。
 * @param filePath - JSON 文件路径。
 * @returns 解析后的 JSON 内容。
 * @public
 */
export function readJson<TResult = unknown>(filePath: string): TResult {
  return JSON.parse(readFileSync(filePath, 'utf8')) as TResult
}

/**
 * 把值序列化并写入 JSON 文件。
 *
 * @param filePath - 目标 JSON 文件路径。
 * @param content - 需要序列化的值。
 * @param options - JSON 写入选项。
 * @public
 */
export function writeJson(filePath: string, content: unknown, options: WriteJsonOptions = {}): void {
  ensureDir(dirname(filePath))
  writeTextIfChanged(filePath, jsonText(content, options))
}

/**
 * 仅在 JSON 序列化结果变化时写入文件。
 *
 * @param filePath - 目标 JSON 文件路径。
 * @param content - 需要序列化的值。
 * @param options - JSON 写入选项。
 * @returns 写入了新内容时返回 true，否则返回 false。
 * @public
 */
export function writeJsonIfChanged(filePath: string, content: unknown, options: WriteJsonOptions = {}): boolean {
  ensureDir(dirname(filePath))
  return writeTextIfChanged(filePath, jsonText(content, options))
}

function jsonText(content: unknown, options: WriteJsonOptions): string {
  return options.compact ? `${JSON.stringify(content)}\n` : `${JSON.stringify(content, null, 2)}\n`
}
