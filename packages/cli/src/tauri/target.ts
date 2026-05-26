/**
 * Tauri 应用目标与目标命令入口。
 *
 * 本文件同时负责两类稳定能力：
 * - 读取 `config.ts`，解析可打包的前端应用目标。
 * - 执行 `tauri:target` 命令，把项目级平台名映射为 Tauri CLI / Cargo Tauri 调用。
 * - 提供发布平台注册表，避免 target 和 release 各自维护平台、命令和产物目录。
 *
 * `sync.ts`、`deps.ts` 和 `release.ts` 都复用这里的目标解析规则，避免目标名、
 * 默认目标、配置合并和平台矩阵在多个命令之间漂移。
 */
import type { AppTarget, TargetCommandConfig, TargetRunOptions, TargetRunResult, TauriCommandOptions, TauriCommandParts, TauriConfig, TauriPlatform } from '#/types/tauri.ts'
import { isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import { cancel, isCancel, log, multiselect, select } from '@clack/prompts'
import { ensureDir, readJson, writeJson } from '@tauri-vue-template/utils/node'
import { appTargetDefinitions, defaultTarget } from '#/tauri/config.ts'
import { runCommandEntry, runLive, srcTauriRoot, tauriRoot, workspaceRoot } from '#/utils.ts'

export { defaultTarget }

type SyncRunner = (args: string[]) => Promise<void> | void

const targetRuntimeConfigRoot = resolve(workspaceRoot, '.tmp/tauri-targets')
const defaultConfigPath = resolve(srcTauriRoot, 'tauri.conf.json')

/**
 * 项目级平台命令到真实 Tauri/Cargo 命令的唯一映射入口。
 *
 * `tauri:target` 和 `tauri:release` 都从这里取命令，避免打包目标、bundle 类型或
 * Android ABI 策略在两套流程中漂移。
 */
type CommandPartBuilder = (configPath: string, options: TauriCommandOptions) => TauriCommandParts

interface PlatformCommand extends TauriPlatform {
  build: CommandPartBuilder
}

const platformCommands: PlatformCommand[] = [
  {
    name: 'macos',
    label: 'macOS',
    onlyOn: 'darwin',
    outputs: ['src-tauri/target/universal-apple-darwin/release/bundle', 'src-tauri/target/aarch64-apple-darwin/release/bundle', 'src-tauri/target/x86_64-apple-darwin/release/bundle'],
    extensions: ['.dmg'],
    build: config => pnpmTauri(['build', '--config', config, '--target', 'universal-apple-darwin', '--bundles', 'dmg']),
  },
  {
    name: 'windows',
    label: 'Windows',
    onlyOn: 'win32',
    outputs: ['src-tauri/target/x86_64-pc-windows-msvc/release/bundle'],
    extensions: ['.exe'],
    build: config => pnpmTauri(['build', '--config', config, '--target', 'x86_64-pc-windows-msvc', '--bundles', 'nsis']),
  },
  {
    name: 'linux',
    label: 'Linux',
    onlyOn: 'linux',
    outputs: ['src-tauri/target/x86_64-unknown-linux-gnu/release/bundle'],
    extensions: ['.deb'],
    build: config => pnpmTauri(['build', '--config', config, '--target', 'x86_64-unknown-linux-gnu', '--bundles', 'deb']),
  },
  {
    name: 'android',
    label: 'Android',
    outputs: ['src-tauri/gen/android/app/build/outputs'],
    extensions: ['.aab', '.apk'],
    sync: true,
    build: (config, options) => pnpmTauri(['android', 'build', '--config', config, ...(options.androidAbi === 'aarch64' ? ['--target', 'aarch64'] : [])]),
  },
  {
    name: 'ios',
    label: 'iOS',
    onlyOn: 'darwin',
    outputs: ['src-tauri/gen/apple/build'],
    extensions: ['.ipa'],
    sync: true,
    build: config => pnpmTauri(['ios', 'build', '--config', config]),
  },
  {
    name: 'harmony',
    label: 'OpenHarmony',
    outputs: ['src-tauri/gen/ohos'],
    extensions: ['.app', '.hap', '.har'],
    sync: true,
    build: config => cargoTauri(['ohos', 'build', '--config', config, '--debug', '--target', 'aarch64', '--ci']),
  },
]

export const tauriPlatforms: TauriPlatform[] = platformCommands.map(({ build: _build, ...platform }) => platform)

export function availableTauriPlatforms() {
  return tauriPlatforms.filter(platform => !platform.onlyOn || platform.onlyOn === process.platform)
}

export function resolveTauriPlatform(name: string | undefined) {
  if (!name)
    throw new Error('缺少平台名称。')

  const platform = availableTauriPlatforms().find(target => target.name === name)
  if (!platform) {
    const available = availableTauriPlatforms().map(target => target.name).join(', ')
    throw new Error(`未知或当前平台不可用的发布平台：${name}。可用平台：${available}`)
  }
  return platform
}

const tauriCommandBuilders: Record<string, CommandPartBuilder> = {
  'dev': config => pnpmTauri(['dev', '--config', config]),
  ...Object.fromEntries(platformCommands.map(platform => [platform.name, platform.build])),
  'android-dev': config => pnpmTauri(['android', 'dev', '--config', config]),
  'android-run': config => pnpmTauri(['android', 'run', '--config', config]),
  'ios-dev': config => pnpmTauri(['ios', 'dev', '--config', config]),
  'ios-run': config => pnpmTauri(['ios', 'run', '--config', config]),
  'harmony-dev': config => cargoTauri(['ohos', 'dev', '--config', config]),
}

export function tauriCommandParts(commandName: string, configPath: string, options: TauriCommandOptions = {}): TauriCommandParts {
  const build = tauriCommandBuilders[commandName]
  if (!build)
    throw new Error(`未知 Tauri 构建命令：${commandName || '(空)'}`)
  return build(configPath, options)
}

function pnpmTauri(args: string[]): TauriCommandParts {
  return { runner: 'pnpm', args: ['exec', 'tauri', ...args] }
}

function cargoTauri(args: string[]): TauriCommandParts {
  return { runner: 'cargo', args: ['tauri', ...args] }
}

// 命令注册表就是 `tauri:target` 的公开语法；不要在这里添加别名，
// 除非该命令名应成为文档化的长期 CLI 契约。
const commands: Record<string, TargetCommandConfig> = {
  'targets': {
    label: '列出应用目标',
    noTarget: true,
    run: printTargets,
  },
  'dev': {
    label: '桌面调试',
    singleTarget: true,
  },
  ...Object.fromEntries(platformCommands.map(platform => [platform.name, {
    label: `${platform.label} 打包`,
    onlyOn: platform.onlyOn,
    sync: platform.sync,
  }])),
  'android-dev': {
    label: 'Android 调试',
    singleTarget: true,
    sync: true,
  },
  'android-run': {
    label: 'Android 运行',
    singleTarget: true,
    sync: true,
  },
  'ios-dev': {
    label: 'iOS 调试',
    singleTarget: true,
    sync: true,
    onlyOn: 'darwin',
  },
  'ios-run': {
    label: 'iOS 运行',
    singleTarget: true,
    sync: true,
    onlyOn: 'darwin',
  },
  'harmony-dev': {
    label: 'OpenHarmony 调试',
    singleTarget: true,
    sync: true,
  },
}

export async function runTauriTarget(rawArgs: string[], syncRunner?: SyncRunner) {
  if (isInteractiveRequest(rawArgs)) {
    await runInteractiveTarget(syncRunner)
    return
  }

  const { commandName, targetSelector, passthroughArgs } = parseArgs(rawArgs)
  const command = resolveCommand(commandName)

  if (command.run) {
    command.run()
    return
  }

  const targets = command.noTarget ? [] : resolveAppTargets(targetSelector)
  if (command.singleTarget && targets.length !== 1)
    throw new Error(`${command.label} 是长驻或设备调试命令，只能选择单个应用目标。`)

  const results = await runTauriTargetCommand(commandName, targets, { passthroughArgs, syncRunner })
  const failed = results.find(result => result.status !== 0)
  if (failed)
    process.exit(failed.status)
}

/** 把 CLI 目标选择器展开为具体应用目标：默认目标、`all` 或逗号分隔目标列表。 */
export function resolveAppTargets(selector = defaultTarget) {
  const targets = loadAppTargets()
  const defaultName = defaultTarget
  const normalizedSelector = selector || defaultName

  if (normalizedSelector === 'all')
    return targets

  const selectedNames = normalizedSelector.split(',').map(name => name.trim()).filter(Boolean)

  if (selectedNames.length === 0)
    return [targets.find(target => target.name === defaultName) as AppTarget]

  return selectedNames.map((name) => {
    const target = targets.find(item => item.name === name)
    if (!target) {
      const available = targets.map(item => item.name).join(', ')
      throw new Error(`未知 Tauri 应用目标：${name}。可用目标：${available}`)
    }

    return target
  })
}

/** 把 config.ts 中的目标定义校验成运行期目标，并拒绝重复或格式错误的目标名。 */
export function loadAppTargets(): AppTarget[] {
  const seen = new Set<string>()

  const targets = appTargetDefinitions.map((target) => {
    if (!/^[a-z][a-z0-9-]*$/.test(target.name))
      throw new Error(`Tauri 目标名只能使用小写字母、数字和短横线：${target.name}`)

    if (seen.has(target.name))
      throw new Error(`Tauri 目标名重复：${target.name}`)

    seen.add(target.name)

    return {
      name: target.name,
      label: target.label,
      config: structuredClone(target.config),
      configSource: `packages/cli/src/tauri/config.ts#${target.name}`,
    }
  })

  if (!seen.has(defaultTarget))
    throw new Error(`默认 Tauri 目标不存在：${defaultTarget}`)

  return targets
}

export async function promptSingleTargetName(message = '选择应用目标') {
  const value = await select<string>({
    message,
    initialValue: defaultTarget,
    options: targetOptions(),
  })

  if (isCancel(value)) {
    cancel('已取消。')
    return null
  }

  return value
}

export async function promptTargetSelector(message = '选择应用目标') {
  const values = await multiselect<string>({
    message,
    required: true,
    initialValues: [defaultTarget],
    options: targetOptions(),
  })

  if (isCancel(values)) {
    cancel('已取消。')
    return null
  }

  return values.join(',')
}

export async function promptTauriPlatform(message = '选择发布平台') {
  const value = await select<string>({
    message,
    options: availableTauriPlatforms().map(platform => ({
      label: platform.label,
      value: platform.name,
      hint: `产物 ${platform.extensions.join(' / ')}`,
    })),
  })

  if (isCancel(value)) {
    cancel('已取消。')
    return null
  }

  return resolveTauriPlatform(value)
}

export function resolveSingleAppTarget(selector: string | undefined, multiError = '只能指定单个应用目标。') {
  if (!selector)
    throw new Error('缺少应用目标名称。')

  const targets = resolveAppTargets(selector)
  if (targets.length !== 1)
    throw new Error(multiError)
  return targets[0]
}

function targetOptions() {
  const defaultName = defaultTarget
  return loadAppTargets().map(target => ({
    label: target.label,
    value: target.name,
    hint: target.name === defaultName ? `${target.name}，默认` : target.name,
  }))
}

/**
 * 读取目标的最终 Tauri 配置：目标覆盖配置会叠加到基础 `tauri.conf.json` 上。
 * 数组按整体覆盖处理，不做拼接，避免生成不可预测的混合配置。
 */
export function readEffectiveTauriConfig(target: AppTarget) {
  return deepMerge(readJson(defaultConfigPath), target.config)
}

export function readTauriBuildTarget(target: AppTarget) {
  const config = normalizeConfigPaths(structuredClone(readEffectiveTauriConfig(target)) as TauriConfig)
  const frontendDist = config.build?.frontendDist
  const version = config.version
  if (typeof frontendDist !== 'string' || frontendDist.length === 0)
    throw new Error(`${target.configSource} 缺少必要字段：build.frontendDist`)
  if (typeof version !== 'string' || version.length === 0)
    throw new Error(`${target.configSource} 缺少必要字段：version`)
  return { config, frontendDist, version }
}

function writeTauriConfig(target: AppTarget) {
  ensureDir(targetRuntimeConfigRoot)
  const config = readTauriBuildTarget(target).config
  const configPath = resolve(targetRuntimeConfigRoot, `tauri.${target.name}.conf.json`)
  writeJson(configPath, config)
  return configPath
}

function normalizeConfigPaths(config: TauriConfig) {
  const frontendDist = config.build?.frontendDist
  if (typeof frontendDist === 'string' && !isAbsolute(frontendDist)) {
    config.build ??= {}
    config.build.frontendDist = resolve(srcTauriRoot, frontendDist)
  }
  return config
}

/** 执行已解析好的应用目标。这里只服务 `tauri:target` 自身，不再作为 release 的间接入口。 */
async function runTauriTargetCommand(commandName: string, targets: AppTarget[], options: TargetRunOptions & { syncRunner?: SyncRunner } = {}): Promise<TargetRunResult[]> {
  const command = resolveCommand(commandName)
  if (command.run || command.noTarget)
    throw new Error(`${command.label} 不是可构建的应用目标命令。`)

  if (command.onlyOn && command.onlyOn !== process.platform)
    throw new Error(`${command.label} 需要在 ${command.onlyOn} 环境执行，当前平台是 ${process.platform}。`)

  if (command.singleTarget && targets.length !== 1)
    throw new Error(`${command.label} 是长驻或设备调试命令，只能选择单个应用目标。`)

  const results: TargetRunResult[] = []
  for (const target of targets) {
    const result = await runForTarget(commandName, command, target, options)
    results.push(result)
    if (result.status !== 0)
      break
  }
  return results
}

function isInteractiveRequest(args: string[]) {
  return args.every(arg => arg === '--')
}

async function runInteractiveTarget(syncRunner?: SyncRunner) {
  const commandName = await promptTargetCommand()
  if (!commandName)
    return

  const command = resolveCommand(commandName)
  if (command.run) {
    command.run()
    return
  }

  const targetSelector = command.singleTarget
    ? await promptSingleTargetName(`${command.label}只能选择一个应用目标`)
    : await promptTargetSelector(`${command.label}可选择一个或多个应用目标`)

  if (!targetSelector)
    return

  const results = await runTauriTargetCommand(commandName, resolveAppTargets(targetSelector), { syncRunner })
  const failed = results.find(result => result.status !== 0)
  if (failed)
    process.exit(failed.status)
}

async function promptTargetCommand() {
  const value = await select<string>({
    message: '选择 Tauri 目标命令',
    options: Object.entries(commands).map(([name, command]) => ({
      value: name,
      label: command.label,
      hint: commandHint(command),
      disabled: Boolean(command.onlyOn && command.onlyOn !== process.platform),
    })),
  })

  if (isCancel(value)) {
    cancel('已取消。')
    return null
  }

  return value
}

function commandHint(command: TargetCommandConfig) {
  if (command.noTarget)
    return '不需要选择应用目标'
  if (command.onlyOn && command.onlyOn !== process.platform)
    return `需要 ${command.onlyOn}，当前 ${process.platform}`
  if (command.singleTarget)
    return '单选应用目标'
  return '可多选应用目标'
}

function resolveCommand(commandName: string) {
  const command = commands[commandName]
  if (!command) {
    const available = Object.keys(commands).join(', ')
    throw new Error(`未知 Tauri 构建命令：${commandName || '(空)'}。可用命令：${available}`)
  }
  return command
}

function printTargets() {
  log.info('Tauri 应用目标：')
  const defaultName = defaultTarget
  for (const target of loadAppTargets()) {
    const defaultMark = target.name === defaultName ? '默认' : '可选'
    console.log(`- ${target.name}：${target.label}（${defaultMark}，${target.configSource}）`)
  }
  console.log('')
  console.log('使用示例：pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples,template')
  console.log('使用示例：pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target all')
  console.log('额外 Tauri CLI 参数使用 --tauri 分隔，例如：pnpm --filter @tauri-vue-template/cli tauri:target -- macos --target examples --tauri --debug')
}

/**
 * 只解析本命令自己的参数语法。`--tauri` 后面的内容原样交给 Tauri，
 * 这样未来新增 Tauri CLI 参数时不需要修改这层包装。
 */
function parseArgs(args: string[]) {
  const tauriSeparatorIndex = args.indexOf('--tauri')
  const ownArgs = tauriSeparatorIndex === -1 ? args : args.slice(0, tauriSeparatorIndex)
  const passthroughArgs = tauriSeparatorIndex === -1 ? [] : args.slice(tauriSeparatorIndex + 1)
  const commandIndex = ownArgs.findIndex(arg => arg !== '--')
  const commandName = commandIndex === -1 ? '' : ownArgs[commandIndex]
  let targetSelector = defaultTarget

  for (let index = commandIndex + 1; index < ownArgs.length; index += 1) {
    const arg = ownArgs[index]

    if (arg === '--')
      continue

    if (arg === '--target') {
      targetSelector = requiredValue(ownArgs, index, '--target')
      index += 1
      continue
    }

    if (arg.startsWith('--target=')) {
      targetSelector = arg.slice('--target='.length)
      continue
    }

    throw new Error(`未知参数：${arg}`)
  }

  return { commandName, targetSelector, passthroughArgs }
}

function requiredValue(args: string[], index: number, name: string) {
  const value = args[index + 1]
  if (!value)
    throw new Error(`${name} 缺少参数值。`)

  return value
}

/**
 * 执行一个选中的应用目标，并在非默认移动端目标构建后把生成工程元信息恢复到默认目标。
 * 移动端同步入口由 CLI 顶层注入，避免 `target.ts` 与 `sync.ts` 形成静态循环依赖。
 */
async function runForTarget(commandName: string, command: TargetCommandConfig, target: AppTarget, options: TargetRunOptions & { syncRunner?: SyncRunner }): Promise<TargetRunResult> {
  console.log('')
  log.info(`${command.label}：${target.label} (${target.name})`)

  const startedAtMs = Date.now()
  const startedAt = new Date(startedAtMs).toISOString()
  const commandParts = tauriCommandParts(commandName, writeTauriConfig(target))
  const passthroughArgs = options.passthroughArgs ?? []
  const commandArgs = [...commandParts.args, ...passthroughArgs]
  const runner = commandParts.runner
  let status = 1

  try {
    if (command.sync)
      await runSyncTarget(options.syncRunner, target.name)

    const result = await runLive(runner, commandArgs, { cwd: tauriRoot, output: options.output })
    status = result.status
  }
  finally {
    if (command.sync && target.name !== defaultTarget)
      await runSyncTarget(options.syncRunner, defaultTarget)
  }

  const endedAtMs = Date.now()
  const runResult: TargetRunResult = {
    args: commandArgs,
    command: commandName,
    endedAt: new Date(endedAtMs).toISOString(),
    label: command.label,
    runner,
    startedAt,
    status,
    target,
    timeMs: endedAtMs - startedAtMs,
  }

  if (status === 0)
    log.success(`${command.label}完成：${target.label}`)

  return runResult
}

async function runSyncTarget(syncRunner: SyncRunner | undefined, targetName: string) {
  if (!syncRunner)
    throw new Error('移动端目标命令需要同步生成工程，但当前没有注入 sync 执行器。')

  await syncRunner(['--target', targetName])
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override))
    return structuredClone(override)

  const result = structuredClone(base) as Record<string, unknown>

  for (const [key, value] of Object.entries(override)) {
    result[key] = isRecord(value) && isRecord(result[key])
      ? deepMerge(result[key], value)
      : structuredClone(value)
  }

  return result
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

runCommandEntry(import.meta.url, async (args) => {
  const { runTauriSync } = await import('#/tauri/sync.ts')
  await runTauriTarget(args, runTauriSync)
})
