import type { FilePredicate } from './types.ts'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { hasPathExtension } from './path.ts'

/**
 * 确保目录存在。
 *
 * @param dirPath - 需要创建的目录路径。
 * @public
 */
export function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true })
}

/**
 * 删除文件或目录。
 *
 * 内部带少量重试，适合清理构建缓存、临时目录和符号链接残留。
 *
 * @param targetPath - 需要删除的路径。
 * @public
 */
export function removePath(targetPath: string): void {
  rmSync(targetPath, { force: true, maxRetries: 3, recursive: true, retryDelay: 100 })
}

/**
 * 移动文件或目录，跨设备移动时自动回退为复制后删除。
 *
 * 目标父目录会自动创建；所有参数都按路径处理，不经过 shell。
 *
 * @param sourcePath - 源文件或目录路径。
 * @param targetPath - 目标路径。
 * @public
 */
export function movePath(sourcePath: string, targetPath: string): void {
  ensureDir(dirname(targetPath))
  try {
    renameSync(sourcePath, targetPath)
  }
  catch (error: unknown) {
    if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'EXDEV')
      throw error
    cpSync(sourcePath, targetPath, { recursive: true })
    removePath(sourcePath)
  }
}

/**
 * 为目录内文件生成不冲突的路径。
 *
 * 文件名已存在时追加 `-1`、`-2` 等序号；支持 `.tar.gz` 这类调用方传入的复合后缀。
 *
 * @param targetDir - 目标目录。
 * @param fileName - 文件名或完整路径；只读取 basename。
 * @param extensions - 可选复合后缀列表，用于正确插入序号。
 * @returns 当前不存在的目标路径。
 * @public
 */
export function uniqueFilePath(targetDir: string, fileName: string, extensions: readonly string[] = []): string {
  const name = basename(fileName)
  const extension = extensions.find(item => name.toLowerCase().endsWith(item.toLowerCase())) ?? extname(name)
  const stem = extension ? name.slice(0, -extension.length) : name
  let destination = join(targetDir, name)
  let index = 1

  while (existsSync(destination)) {
    destination = join(targetDir, `${stem}-${index}${extension}`)
    index += 1
  }
  return destination
}

/**
 * 仅在内容变化时写入文本文件。
 *
 * @param filePath - 目标文件路径。
 * @param content - 新文件内容。
 * @returns 写入了新内容时返回 true，否则返回 false。
 * @public
 */
export function writeTextIfChanged(filePath: string, content: string): boolean {
  const previousContent = existsSync(filePath) ? readFileSync(filePath, 'utf8') : null
  if (previousContent === content)
    return false

  writeFileSync(filePath, content)
  return true
}

/**
 * 递归查找满足谓词的文件。
 *
 * @param rootDir - 查找根目录；不存在时返回空数组。
 * @param predicate - 文件路径谓词，只会收到普通文件路径。
 * @returns 满足条件的文件路径列表。
 * @public
 */
export function findFiles(rootDir: string, predicate: FilePredicate): string[] {
  if (!existsSync(rootDir))
    return []

  const matchedFiles: string[] = []

  function walk(currentPath: string): void {
    const currentStat = statSync(currentPath)
    if (!currentStat.isDirectory()) {
      const normalizedPath = currentPath.split('\\').join('/')
      if (predicate(normalizedPath))
        matchedFiles.push(currentPath)
      return
    }

    for (const entryName of readdirSync(currentPath))
      walk(resolve(currentPath, entryName))
  }

  walk(rootDir)
  return matchedFiles
}

/**
 * 递归查找匹配后缀的文件。
 *
 * 支持复合后缀和大小写不敏感比较；根目录不存在时返回空数组。
 *
 * @param rootDir - 查找根目录。
 * @param extensions - 允许的文件后缀列表。
 * @returns 匹配后缀的文件路径列表。
 * @public
 */
export function findFilesByExtension(rootDir: string, extensions: readonly string[]): string[] {
  return findFiles(rootDir, path => hasPathExtension(path, extensions))
}

/**
 * 删除根目录下的空子目录。
 *
 * 根目录自身不会被删除，只清理它下面已经为空的目录。
 *
 * @param rootDir - 清理根目录。
 * @public
 */
export function pruneEmptyDirs(rootDir: string): void {
  function walk(currentPath: string): boolean {
    if (!existsSync(currentPath) || !statSync(currentPath).isDirectory())
      return false

    for (const entryName of readdirSync(currentPath))
      walk(resolve(currentPath, entryName))

    if (currentPath === rootDir)
      return false

    if (readdirSync(currentPath).length === 0) {
      removePath(currentPath)
      return true
    }

    return false
  }

  walk(rootDir)
}
