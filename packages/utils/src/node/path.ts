import type { AssertInsidePathInput, RelativePathInput, ResolveInputPathInput } from './types.ts'
import { isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'

/**
 * 把目标路径转换成相对指定根目录的路径。
 *
 * 目标不在根目录内时返回原路径，适合日志展示场景。
 *
 * @param input - 路径相对化输入。
 * @returns 相对路径或原始目标路径。
 * @public
 */
export function toRelativePath(input: RelativePathInput): string {
  const relativePath = relative(input.rootDir, input.targetPath)
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath))
    return input.targetPath

  return normalizePathSeparators(relativePath)
}

/**
 * 确认目标路径位于指定根目录内。
 *
 * @param input - 路径包含关系校验输入。
 * @returns 解析后的目标路径。
 * @throws 当目标路径越过根目录时抛错。
 * @public
 */
export function assertInsidePath(input: AssertInsidePathInput): string {
  const resolvedTargetPath = resolve(input.rootDir, input.targetPath)
  const relativePath = relative(input.rootDir, resolvedTargetPath)
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath))
    throw new Error(`${input.label} 必须位于 ${input.rootDir} 内：${input.targetPath}`)

  return resolvedTargetPath
}

/**
 * 把 Windows 路径分隔符归一化成 `/`。
 *
 * @param pathText - 待归一化路径文本。
 * @returns 使用 `/` 分隔的路径文本。
 * @public
 */
export function normalizePathSeparators(pathText: string): string {
  return pathText.split('\\').join('/')
}

/**
 * 判断路径文本是否匹配任一后缀。
 *
 * 支持 `.tar.gz` 这类复合后缀，并按大小写不敏感方式比较，适合扫描 CLI 产物。
 *
 * @param pathText - 待判断的路径文本。
 * @param extensions - 允许的后缀列表，包含开头的 `.`。
 * @returns 匹配任一后缀时返回 true。
 * @public
 */
export function hasPathExtension(pathText: string, extensions: readonly string[]): boolean {
  const lowerPath = pathText.toLowerCase()
  return extensions.some(extension => lowerPath.endsWith(extension.toLowerCase()))
}

/**
 * 展开命令行输入中的用户主目录写法。
 *
 * 只处理 `~` 和 `~/...`，其它路径仅去除首尾空白，避免替调用方改变相对路径语义。
 *
 * @param pathText - 用户输入的路径文本。
 * @param homeDir - 用户主目录；默认读取 `process.env.HOME`。
 * @returns 展开后的路径文本。
 * @public
 */
export function expandHomePath(pathText: string, homeDir = process.env.HOME): string {
  const trimmed = pathText.trim()
  if (trimmed === '~')
    return homeDir || trimmed
  if (trimmed.startsWith('~/'))
    return homeDir ? resolve(homeDir, trimmed.slice(2)) : trimmed
  return trimmed
}

/**
 * 把命令行输入路径解析为绝对路径。
 *
 * 先展开 `~`，再把相对路径按给定根目录解析；不会检查路径是否存在。
 *
 * @param input - 输入路径和相对解析根目录。
 * @returns 绝对路径。
 * @public
 */
export function resolveInputPath(input: ResolveInputPathInput): string {
  const expandedPath = expandHomePath(input.targetPath)
  return isAbsolute(expandedPath) ? expandedPath : resolve(input.rootDir, expandedPath)
}
