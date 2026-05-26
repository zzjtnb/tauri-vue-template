/**
 * 本地 Git exclude 同步命令。
 *
 * 该命令只修改 `.git/info/exclude`，用于隐藏个人代理配置、备份目录等本地文件。
 * 它不修改 `.gitignore`，也不会产生可提交的忽略规则变更。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { log } from '@clack/prompts'
import { runCommandEntry, workspaceRoot } from '#/utils.ts'

// 默认清单只包含本仓库常见的本地辅助文件；项目级忽略规则仍应写入 `.gitignore`。
const defaultItems = ['.agent', '.agents', '.claude', '.gitnexus', 'AGENTS.md', 'CLAUDE.md', 'backup']
const excludeFile = resolve(workspaceRoot, '.git/info/exclude')

export function runExcludeLocal(args: string[]) {
  if (!existsSync(resolve(workspaceRoot, '.git')))
    throw new Error('此命令需在 Git 仓库中使用。')

  const { action, targets } = parseArgs(args)
  const previous = readFileSync(excludeFile, 'utf8')
  let next = previous

  log.info(`同步本地 Git exclude：${action}`)

  if (action === 'add') {
    for (const item of targets) {
      if (previous.split('\n').includes(item)) {
        log.success(`路径已存在：${item}`)
        continue
      }
      next += next.endsWith('\n') || next.length === 0 ? item : `\n${item}`
      next += '\n'
      log.success(`已排除路径：${item}`)
    }
  }
  else {
    const lines = next.split('\n')
    next = lines.filter(line => !targets.includes(line)).join('\n')
    for (const item of targets)
      log.success(`已确保取消排除：${item}`)
  }

  writeFileSync(excludeFile, next)
}

/**
 * 解析 `add` / `del` 两种显式操作。
 * 没有传操作时默认执行 add，方便首次初始化本地 exclude。
 */
function parseArgs(args: string[]) {
  const action = args[0] === 'del' ? 'del' : args[0] === 'add' || !args[0] ? 'add' : null
  if (!action)
    throw new Error(`未知操作 ${args[0]}，请使用 add 或 del。`)

  const targets = args.slice(action === 'add' && args[0] !== 'add' ? 0 : 1)
  return { action, targets: targets.length > 0 ? targets : defaultItems }
}

runCommandEntry(import.meta.url, runExcludeLocal)
