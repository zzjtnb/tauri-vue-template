/**
 * CLI 内部通用工具。
 *
 * 本文件只放所有命令都会共享的基础能力：workspace 路径锚点和安全子进程执行。
 * 业务命令逻辑继续留在各自目录，避免重新制造 shared/config/process 这类泛目录。
 */
import type { Buffer } from 'node:buffer'
import type { RunLiveResult, RunOptions, RunOutputStream } from '#/types/shell.ts'
import { spawn, spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { log } from '@clack/prompts'

const runtimeDir = import.meta.dirname

/** CLI 包根目录；源码运行时从 src 回退一级，打包运行时从 dist 回退一级。 */
export const packageRoot = resolve(runtimeDir, '..')
/** workspace 根目录。 */
export const workspaceRoot = resolve(packageRoot, '../..')
/** Tauri 打包器包目录。 */
export const tauriRoot = resolve(workspaceRoot, 'apps/tauri')
/** Tauri Rust 工程目录。 */
export const srcTauriRoot = resolve(tauriRoot, 'src-tauri')
/** 共享静态资源包目录。 */
export const assetsRoot = resolve(workspaceRoot, 'packages/assets')

/** 格式化单个参数用于日志展示，不改变真实执行语义。 */
export function commandArg(value: string) {
  return /^[\w./:@+=,-]+$/.test(value)
    ? value
    : `'${value.replaceAll('\'', `'\\''`)}'`
}

export function formatCommand(parts: string[]) {
  return parts.map(commandArg).join(' ')
}

/**
 * 执行短生命周期命令，并把原始 `spawnSync` 结果交给调用方。
 * 调用方可以先检查 status/stdout/stderr，再决定是否失败。
 */
export function runSync(command: string, args: string[], options: RunOptions = {}) {
  if (!options.silent)
    log.info(`$ ${formatCommand([command, ...args])}`)

  return spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    maxBuffer: options.maxBuffer ?? 1024 * 1024 * 50,
    stdio: options.inherit
      ? 'inherit'
      : ['ignore', 'pipe', 'pipe'],
  })
}

function writeOutput(options: RunOptions, stream: RunOutputStream, chunk: Buffer) {
  if (options.stdio !== 'ignore') {
    const target = stream === 'stdout' ? process.stdout : process.stderr
    target.write(chunk)
  }

  options.output?.(chunk.toString('utf8'), stream)
}

/**
 * 执行需要实时输出的命令，并在需要时把 stdout/stderr 旁路复制给调用方。
 * 有 output 监听器时不能使用 stdio inherit，否则 Node 拿不到可写入日志文件的输出流。
 */
export async function runLive(command: string, args: string[], options: RunOptions = {}): Promise<RunLiveResult> {
  const commandLine = `$ ${formatCommand([command, ...args])}`
  if (!options.silent)
    log.info(commandLine)
  options.output?.(`${commandLine}\n`, 'stdout')

  const shouldPipe = Boolean(options.output) || options.stdio === 'pipe'
  return await new Promise<RunLiveResult>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: shouldPipe ? ['inherit', 'pipe', 'pipe'] : options.stdio ?? 'inherit',
    })

    child.stdout?.on('data', chunk => writeOutput(options, 'stdout', chunk))
    child.stderr?.on('data', chunk => writeOutput(options, 'stderr', chunk))
    child.on('error', reject)
    child.on('exit', code => resolvePromise({ status: code ?? 1 }))
  })
}

/** 执行应快速失败的命令；非零退出码会抛出错误。 */
export async function run(command: string, args: string[], options: RunOptions = {}) {
  const result = await runLive(command, args, options)
  if (result.status !== 0)
    throw new Error(`命令失败：${command} ${args.join(' ')}，退出码 ${result.status}`)
}

/** 让具体命令文件自行判断是否作为 Node 入口执行，避免根入口承担命令路由。 */
function isDirectRun(metaUrl: string) {
  return typeof process.argv[1] === 'string' && metaUrl === pathToFileURL(resolve(process.argv[1])).href
}

/** 具体命令入口统一错误展示；错误来源仍由各命令文件自己决定。 */
function exitWithError(error: unknown) {
  log.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

export function runCommandEntry(metaUrl: string, runner: (args: string[]) => Promise<void> | void) {
  if (!isDirectRun(metaUrl))
    return

  Promise.resolve(runner(process.argv.slice(2))).catch(exitWithError)
}
