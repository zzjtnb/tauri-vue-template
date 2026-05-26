/**
 * Tauri 依赖同步工具。
 *
 * 本命令检查 npm 侧 `@tauri-apps/*` 包和 Rust 侧 Cargo crate 是否保持同一条版本线。
 * 检查模式只读；更新模式会显式修改 Cargo.toml、Cargo.lock、package.json 或 lockfile，
 * 并在每次修改后再次执行检查，避免前后端 Tauri 依赖漂移。
 */
import type { JsonRecord } from '#/types/tauri.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { cancel, isCancel, log, select, text } from '@clack/prompts'
import { readJson } from '@tauri-vue-template/utils/node'
import { defaultTarget, promptSingleTargetName, readTauriBuildTarget, resolveAppTargets } from '#/tauri/target.ts'
import { runCommandEntry, runSync, tauriRoot } from '#/utils.ts'

interface CheckResult {
  level: 'fail' | 'pass' | 'warn'
  message: string
}

interface NpmSyncAction {
  cwd: string
  dev: boolean
  packageName: string
  version: string
}

interface PackageJsonDependencies {
  dependencies?: JsonRecord
  devDependencies?: JsonRecord
}

const tauriPackageJsonPath = resolve(tauriRoot, 'package.json')
const cargoManifestPath = resolve(tauriRoot, 'src-tauri/Cargo.toml')
const cargoLockPath = resolve(tauriRoot, 'src-tauri/Cargo.lock')
// 结果先收集再统一打印，保证检查过程能一次性暴露所有依赖漂移点。
const results: CheckResult[] = []

interface DepsContext {
  frontendPackageJsonPath: string
  frontendPackageRoot: string
  targetName: string
}

export async function runTauriDeps(rawArgs: string[] = []) {
  const parsed = parseArgs(rawArgs)
  const targetName = parsed.interactive
    ? await promptSingleTargetName('选择要检查 Tauri 依赖的应用目标')
    : parsed.targetName

  if (!targetName)
    return

  const context = resolveDepsContext(targetName)
  const action = parsed.action ?? await promptDepsAction(context)
  if (!action)
    return

  await runDepsAction(action, parsed.actionArgs, context)
}

async function promptDepsAction(context: DepsContext) {
  const action = await select({
    message: `Tauri 依赖工具（${context.targetName}）`,
    options: [
      { label: '检查', value: '__group_check', disabled: true },
      { label: '检查 Tauri 依赖同步', value: 'check', hint: '只检查 npm 包和 Cargo crate 是否同步。' },
      { label: '更新', value: '__group_update', disabled: true },
      { label: '更新 OpenHarmony 核心并同步 npm', value: 'openharmony', hint: '更新 tauri / tauri-build，再同步 npm。' },
      { label: '更新单个 Tauri 插件', value: 'plugin', hint: '输入插件名和版本，保持两侧 exact version。' },
      { label: '说明', value: '__group_help', disabled: true },
      { label: '查看菜单说明', value: 'help', hint: '说明每个菜单项的作用。' },
    ],
  })

  if (isCancel(action)) {
    cancel('已取消。')
    return null
  }

  return action
}

async function runDepsAction(action: string, actionArgs: string[], context: DepsContext) {
  if (action === 'check') {
    checkDependencies(context)
    return
  }
  if (action === 'openharmony') {
    updateOpenHarmonyLine(context)
    return
  }
  if (action === 'plugin') {
    if (actionArgs.length >= 2)
      updatePlugin(actionArgs, context)
    else
      await updatePluginFromPrompt(context)
    return
  }
  if (action === 'help') {
    printMenuHelp()
    return
  }

  throw new Error(`未知 Tauri 依赖命令：${action}。可用命令：check、openharmony、plugin、help`)
}

function pass(message: string) {
  results.push({ level: 'pass', message })
}

function warn(message: string) {
  results.push({ level: 'warn', message })
}

function fail(message: string) {
  results.push({ level: 'fail', message })
}

function run(commandName: string, args: string[], options: { allowFailure?: boolean, cwd?: string, inherit?: boolean, silent?: boolean } = {}) {
  const result = runSync(commandName, args, { cwd: options.cwd ?? tauriRoot, inherit: options.inherit, silent: options.silent })

  if (result.status !== 0 && !options.allowFailure) {
    if (!options.inherit) {
      if (result.stdout)
        process.stdout.write(result.stdout)
      if (result.stderr)
        process.stderr.write(result.stderr)
    }
    fail(`${commandName} ${args.join(' ')} 执行失败`)
  }

  return result
}

function runOrExit(commandName: string, args: string[], options: { cwd?: string, inherit?: boolean } = {}) {
  const result = run(commandName, args, options)
  if (result.status !== 0)
    exitWithResults(1)
  return result
}

function parseArgs(args: string[]) {
  const actionArgs: string[] = []
  let targetName = defaultTarget

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--')
      continue

    if (arg === '--target') {
      targetName = requiredValue(args, index, '--target')
      index += 1
      continue
    }

    if (arg.startsWith('--target=')) {
      targetName = arg.slice('--target='.length)
      continue
    }

    actionArgs.push(arg)
  }

  return {
    targetName,
    interactive: actionArgs.length === 0,
    action: actionArgs[0],
    actionArgs: actionArgs.slice(1),
  }
}

function requiredValue(args: string[], index: number, name: string) {
  const value = args[index + 1]
  if (!value)
    throw new Error(`${name} 缺少参数值。`)

  return value
}

function resolveDepsContext(targetName: string): DepsContext {
  if (targetName === 'all')
    throw new Error('Tauri 依赖同步一次只能处理一个前端包，请指定单个 --target。')

  const targets = resolveAppTargets(targetName)
  if (targets.length !== 1)
    throw new Error('Tauri 依赖同步一次只能处理一个前端包，请指定单个 --target。')

  const target = targets[0]
  const frontendPackageRoot = dirname(readTauriBuildTarget(target).frontendDist)
  const frontendPackageJsonPath = resolve(frontendPackageRoot, 'package.json')
  if (!existsSync(frontendPackageJsonPath))
    throw new Error(`未找到前端 package.json：${frontendPackageJsonPath}`)

  return { frontendPackageJsonPath, frontendPackageRoot, targetName: target.name }
}

function cleanVersion(version: string | undefined) {
  return version?.replace(/^[~^=]/, '')
}

function parseVersion(version: string) {
  const normalized = cleanVersion(version)
  const match = normalized?.match(/^(\d+)\.(\d+)\.(\d+)/)

  if (!match)
    throw new Error(`无法解析版本号：${version}`)

  return { raw: normalized, major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) }
}

function hasSameMinor(left: string, right: string) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  return a.major === b.major && a.minor === b.minor
}

function sameMinorTarget(version: string) {
  const parsed = parseVersion(version)
  return `${parsed.major}.${parsed.minor}`
}

function readPackageJson(path: string): PackageJsonDependencies {
  return readJson<PackageJsonDependencies>(path)
}

function stringRecord(value: unknown) {
  const result: Record<string, string> = {}
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return result

  for (const [name, version] of Object.entries(value)) {
    if (typeof version === 'string')
      result[name] = version
  }
  return result
}

function npmPackagesFrom(packageJson: PackageJsonDependencies) {
  return { ...stringRecord(packageJson.dependencies), ...stringRecord(packageJson.devDependencies) }
}

function npmPluginEntries(npmPackages: Record<string, string>) {
  return Object.entries(npmPackages)
    .filter(([name]) => name.startsWith('@tauri-apps/plugin-'))
    .map(([name, version]) => ({ npmName: name, npmVersion: cleanVersion(version) ?? version, cargoName: `tauri-plugin-${name.replace('@tauri-apps/plugin-', '')}` }))
}

function readCargoPackages() {
  return parseCargoLock(readFileSync(cargoLockPath, 'utf8'))
}

function parseCargoLock(content: string) {
  const packages: Array<Record<string, string>> = []
  let current: Record<string, string> | null = null

  for (const line of content.split('\n')) {
    if (line.trim() === '[[package]]') {
      if (current)
        packages.push(current)
      current = {}
      continue
    }

    if (!current)
      continue

    const field = line.match(/^([\w-]+) = "(.*)"$/)
    if (field)
      current[field[1]] = field[2]
  }

  if (current)
    packages.push(current)
  return packages
}

/**
 * 在 Cargo.lock 中解析 crate。OpenHarmony 分支可能让同名 crate 出现多个来源，
 * 这里优先选择 OpenHarmony git 来源，并用 warn 暴露这个选择。
 */
function findCargoPackage(packages: Array<Record<string, string>>, name: string) {
  const matches = packages.filter(pkg => pkg.name === name)
  if (matches.length === 0)
    return null
  if (matches.length === 1)
    return matches[0]

  const openHarmonyPackage = matches.find(pkg => pkg.source?.includes('github.com/tauri-apps/tauri') && pkg.source.includes('feat/open-harmony'))
  if (openHarmonyPackage) {
    warn(`Cargo.lock 中存在多个 ${name}，本次选择 OpenHarmony git 来源版本 ${openHarmonyPackage.version}`)
    return openHarmonyPackage
  }

  warn(`Cargo.lock 中存在多个 ${name}，请人工确认使用哪个版本：${matches.map(pkg => pkg.version).join(', ')}`)
  return matches[0]
}

function assertOpenHarmonyLine({ exitOnFailure = false } = {}) {
  const cargoManifest = readFileSync(cargoManifestPath, 'utf8')
  const tauriBuildUsesOpenHarmony = /tauri-build\s*=\s*\{[^}]*git\s*=\s*"https:\/\/github\.com\/tauri-apps\/tauri"[^}]*branch\s*=\s*"feat\/open-harmony"[^}]*\}/.test(cargoManifest)
  const tauriUsesOpenHarmony = /^tauri\s*=\s*\{[^}]*git\s*=\s*"https:\/\/github\.com\/tauri-apps\/tauri"[^}]*branch\s*=\s*"feat\/open-harmony"[^}]*\}/m.test(cargoManifest)

  if (tauriBuildUsesOpenHarmony && tauriUsesOpenHarmony) {
    pass('Cargo.toml 保持 OpenHarmony feat/open-harmony 分支版本线')
    return true
  }

  fail('Cargo.toml 未保持 tauri / tauri-build 的 OpenHarmony feat/open-harmony 分支写法')
  if (exitOnFailure)
    exitWithResults(1)
  return false
}

function printResults() {
  for (const result of results) {
    if (result.level === 'pass')
      log.success(result.message)
    else if (result.level === 'warn')
      log.warn(result.message)
    else
      log.error(result.message)
  }
}

function hasFailures() {
  return results.some(result => result.level === 'fail')
}

function resetResults() {
  results.length = 0
}
function exitWithResults(code = hasFailures() ? 1 : 0): never {
  if (results.length > 0)
    printResults()
  process.exit(code)
}

function finishAndCheck(context: DepsContext) {
  if (results.length > 0)
    printResults()
  log.info('继续执行 check 确认同步结果。')
  resetResults()
  checkDependencies(context)
}

function checkSameMinor(npmName: string, npmVersion: string, cargoName: string, cargoVersion: string) {
  try {
    if (hasSameMinor(npmVersion, cargoVersion))
      pass(`${npmName} ${cleanVersion(npmVersion)} 与 ${cargoName} ${cargoVersion} 保持同 minor`)
    else
      fail(`${npmName} ${cleanVersion(npmVersion)} 与 ${cargoName} ${cargoVersion} minor 不一致`)
  }
  catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}

function checkInstalledNpmPlugins(pluginEntries: ReturnType<typeof npmPluginEntries>, cargoPackages: Array<Record<string, string>>) {
  for (const plugin of pluginEntries) {
    const cargoPackage = findCargoPackage(cargoPackages, plugin.cargoName)
    if (!cargoPackage) {
      fail(`${plugin.npmName} 已安装，但 Cargo.lock 中未找到 ${plugin.cargoName}`)
      continue
    }

    if (plugin.npmVersion === cargoPackage.version)
      pass(`${plugin.npmName} ${plugin.npmVersion} 与 ${plugin.cargoName} ${cargoPackage.version} 完全一致`)
    else
      fail(`${plugin.npmName} ${plugin.npmVersion} 与 ${plugin.cargoName} ${cargoPackage.version} 不一致`)
  }
}

function warnRustOnlyPlugins(pluginEntries: ReturnType<typeof npmPluginEntries>, cargoPackages: Array<Record<string, string>>) {
  const installedNpmPluginNames = new Set(pluginEntries.map(plugin => plugin.cargoName))
  for (const cargoPackage of cargoPackages.filter(pkg => pkg.name?.startsWith('tauri-plugin-'))) {
    if (!installedNpmPluginNames.has(cargoPackage.name))
      warn(`${cargoPackage.name} ${cargoPackage.version} 只有 Rust 侧存在；如果前端不导入对应 @tauri-apps/plugin-*，这是允许的`)
  }
}

function checkDependencies(context: DepsContext) {
  log.info('Tauri 依赖同步检查：本脚本检查 npm 包和 Cargo crate 是否同步，不判断是否为全网 latest。')
  log.info(`前端依赖包：${context.frontendPackageJsonPath}`)
  assertOpenHarmonyLine()

  const metadataResult = run('cargo', ['metadata', '--manifest-path', cargoManifestPath, '--locked', '--format-version', '1'], { silent: true })
  if (metadataResult.status === 0)
    pass('Cargo.toml 与 Cargo.lock 一致')

  const tauriInfoResult = run('pnpm', ['tauri', 'info'], { allowFailure: true })
  if (tauriInfoResult.status === 0)
    pass('pnpm --dir apps/tauri tauri info 未报告版本 mismatch')
  else
    fail('pnpm --dir apps/tauri tauri info 报告版本 mismatch 或执行失败')

  const frontendPackages = npmPackagesFrom(readPackageJson(context.frontendPackageJsonPath))
  const tauriPackages = npmPackagesFrom(readPackageJson(tauriPackageJsonPath))
  const cargoPackages = readCargoPackages()
  const tauri = findCargoPackage(cargoPackages, 'tauri')
  const apiVersion = frontendPackages['@tauri-apps/api']

  if (!tauri)
    fail('Cargo.lock 中未找到 tauri crate')
  else if (!apiVersion)
    warn('前端 package.json 未安装 @tauri-apps/api；如果该前端不直接调用 Tauri API，这是允许的')
  else
    checkSameMinor('@tauri-apps/api', apiVersion, 'tauri', tauri.version as string)

  const cliVersion = tauriPackages['@tauri-apps/cli']
  if (tauri && cliVersion) {
    try {
      if (hasSameMinor(cliVersion, tauri.version as string))
        pass(`@tauri-apps/cli ${cleanVersion(cliVersion)} 与 tauri ${tauri.version} 保持同 minor`)
      else
        warn(`@tauri-apps/cli ${cleanVersion(cliVersion)} 与 tauri ${tauri.version} minor 不一致；如 pnpm --dir apps/tauri tauri info 未报错，可按当前工程可用版本处理`)
    }
    catch (error) {
      fail(error instanceof Error ? error.message : String(error))
    }
  }

  const pluginEntries = npmPluginEntries(frontendPackages)
  checkInstalledNpmPlugins(pluginEntries, cargoPackages)
  warnRustOnlyPlugins(pluginEntries, cargoPackages)
  exitWithResults()
}

function resolveNpmVersion(packageName: string, minorTarget: string) {
  const result = run('pnpm', ['view', `${packageName}@${minorTarget}`, 'version', '--json'], { allowFailure: true })
  if (result.status !== 0) {
    fail(`无法查询 ${packageName}@${minorTarget}；请手动指定可用版本后重新执行`)
    return null
  }

  const output = result.stdout.trim()
  if (!output) {
    fail(`无法解析 ${packageName}@${minorTarget} 的 npm 版本`)
    return null
  }

  try {
    const parsed = JSON.parse(output)
    if (typeof parsed === 'string')
      return parsed
    if (Array.isArray(parsed) && typeof parsed.at(-1) === 'string')
      return parsed.at(-1)
  }
  catch {
    return output.replace(/^"|"$/g, '')
  }

  fail(`无法解析 ${packageName}@${minorTarget} 的 npm 版本`)
  return null
}

/**
 * 根据 Cargo 实际版本生成 npm 同步动作。
 * 只同步项目已安装的前端插件包，避免为 Rust-only 插件隐式新增前端依赖。
 */
function collectNpmSyncActions(context: DepsContext) {
  const frontendPackages = npmPackagesFrom(readPackageJson(context.frontendPackageJsonPath))
  const tauriPackages = npmPackagesFrom(readPackageJson(tauriPackageJsonPath))
  const cargoPackages = readCargoPackages()
  const actions: NpmSyncAction[] = []
  const tauri = findCargoPackage(cargoPackages, 'tauri')

  if (!tauri) {
    fail('Cargo.lock 中未找到 tauri crate，无法同步 npm 包')
    return actions
  }

  const apiVersion = frontendPackages['@tauri-apps/api']
  if (apiVersion && !hasSameMinor(apiVersion, tauri.version as string)) {
    const targetVersion = resolveNpmVersion('@tauri-apps/api', sameMinorTarget(tauri.version as string))
    if (targetVersion)
      actions.push({ cwd: context.frontendPackageRoot, dev: false, packageName: '@tauri-apps/api', version: targetVersion })
  }
  else if (!apiVersion) {
    warn('前端 package.json 未安装 @tauri-apps/api；同步 npm 时不会隐式新增该依赖')
  }

  const cliVersion = tauriPackages['@tauri-apps/cli']
  if (cliVersion && !hasSameMinor(cliVersion, tauri.version as string)) {
    const targetVersion = resolveNpmVersion('@tauri-apps/cli', sameMinorTarget(tauri.version as string))
    if (targetVersion)
      actions.push({ cwd: tauriRoot, dev: true, packageName: '@tauri-apps/cli', version: targetVersion })
  }

  for (const plugin of npmPluginEntries(frontendPackages)) {
    const cargoPackage = findCargoPackage(cargoPackages, plugin.cargoName)
    if (!cargoPackage) {
      fail(`${plugin.npmName} 已安装，但 Cargo.lock 中未找到 ${plugin.cargoName}`)
      continue
    }

    if (plugin.npmVersion !== cargoPackage.version)
      actions.push({ cwd: context.frontendPackageRoot, dev: false, packageName: plugin.npmName, version: cargoPackage.version as string })
  }

  return actions
}

function runPnpmAdd(action: NpmSyncAction) {
  const args = ['add', '-E', `${action.packageName}@${action.version}`]
  if (action.dev)
    args.splice(1, 0, '-D')
  runOrExit('pnpm', args, { cwd: action.cwd, inherit: true })
}

function syncNpmPackages(context: DepsContext) {
  const actions = collectNpmSyncActions(context)
  if (hasFailures())
    exitWithResults(1)

  if (actions.length === 0) {
    pass('npm 侧 Tauri 包已经与 Cargo 实际版本同步，无需安装')
    return
  }

  for (const action of actions) {
    runPnpmAdd(action)
    pass(`${action.packageName} 已同步到 ${action.version}`)
  }
}

function updateOpenHarmonyLine(context: DepsContext) {
  log.info('Tauri 依赖更新：按 OpenHarmony feat/open-harmony 分支版本线更新后端核心依赖，再同步 npm 包。')
  assertOpenHarmonyLine({ exitOnFailure: true })
  runOrExit('cargo', ['update', '--manifest-path', cargoManifestPath, '-p', 'tauri', '-p', 'tauri-build'], { inherit: true })
  pass('已更新或确认 OpenHarmony 分支上的 tauri / tauri-build')
  syncNpmPackages(context)
  runOrExit('pnpm', ['install'], { inherit: true })
  pass('pnpm install 已完成')
  finishAndCheck(context)
}

function normalizePluginName(name: string) {
  return name.replace(/^@tauri-apps\/plugin-/, '').replace(/^tauri-plugin-/, '')
}

function assertVersion(version: string) {
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Z.-]+)?$/i.test(version)) {
    fail(`插件版本必须是明确 semver，例如 2.5.1；当前收到：${version}`)
    exitWithResults(1)
  }
}

function updateCargoPluginVersion(cargoName: string, version: string) {
  const content = readFileSync(cargoManifestPath, 'utf8')
  const escapedName = RegExp.escape(cargoName)
  let count = 0
  let nextContent = content.replace(new RegExp(`(^\\s*${escapedName}\\s*=\\s*)"[^"]+"`, 'gm'), (_, prefix: string) => {
    count += 1
    return `${prefix}"${version}"`
  })

  if (count === 0) {
    nextContent = nextContent.replace(new RegExp(`(^\\s*${escapedName}\\s*=\\s*\\{[^\\n}]*version\\s*=\\s*)"[^"]+"`, 'gm'), (_, prefix: string) => {
      count += 1
      return `${prefix}"${version}"`
    })
  }

  if (count === 0) {
    fail(`src-tauri/Cargo.toml 中未找到 ${cargoName} 直接依赖，请先人工确认插件是否属于当前项目`)
    exitWithResults(1)
  }

  writeFileSync(cargoManifestPath, nextContent)
  pass(`${cargoName} 已在 Cargo.toml 中更新为 ${version}`)
}

async function updatePluginFromPrompt(context: DepsContext) {
  const plugin = await text({ message: '插件名称，例如 fs：' })
  if (isCancel(plugin)) {
    cancel('已取消。')
    return
  }

  const version = await text({ message: '目标版本，例如 2.5.1：' })
  if (isCancel(version)) {
    cancel('已取消。')
    return
  }

  updatePlugin([plugin, version], context)
}

function updatePlugin(args: string[], context: DepsContext) {
  log.info('Tauri 插件依赖更新：显式更新单个插件的 Rust crate，再同步已安装的 npm 插件包 exact version。')
  assertOpenHarmonyLine({ exitOnFailure: true })

  const [rawName, version] = args
  if (!rawName || !version) {
    fail('插件名称和目标版本不能为空；请在菜单中输入插件名和明确版本，例如 fs / 2.5.1')
    exitWithResults(1)
  }

  assertVersion(version)

  const pluginName = normalizePluginName(rawName)
  const cargoName = `tauri-plugin-${pluginName}`
  const npmName = `@tauri-apps/plugin-${pluginName}`

  updateCargoPluginVersion(cargoName, version)
  runOrExit('cargo', ['update', '--manifest-path', cargoManifestPath, '-p', cargoName], { inherit: true })
  pass(`${cargoName} 的 Cargo.lock 已更新`)

  const npmPackages = npmPackagesFrom(readPackageJson(context.frontendPackageJsonPath))
  if (npmPackages[npmName]) {
    runPnpmAdd({ cwd: context.frontendPackageRoot, dev: false, packageName: npmName, version })
    pass(`${npmName} 已同步到 ${version}`)
  }
  else {
    warn(`${npmName} 未安装；如果前端不导入该插件，这是允许的。需要前端 API 时请安装 ${npmName}@${version}`)
  }

  runOrExit('pnpm', ['install'], { inherit: true })
  pass('pnpm install 已完成')
  finishAndCheck(context)
}

function printMenuHelp() {
  log.info('交互入口：pnpm --filter @tauri-vue-template/cli tauri:deps')
  console.log('CLI 检查：pnpm --filter @tauri-vue-template/cli tauri:deps -- check --target examples')
  console.log('CLI 更新 OpenHarmony 核心：pnpm --filter @tauri-vue-template/cli tauri:deps -- openharmony --target examples')
  console.log('CLI 更新单个插件：pnpm --filter @tauri-vue-template/cli tauri:deps -- plugin fs 2.5.1 --target examples')
  console.log('检查 Tauri 依赖同步：只检查 npm 包和 Cargo crate 是否同步，不自动修改依赖。')
  console.log('更新 OpenHarmony 核心并同步 npm：按 OpenHarmony feat/open-harmony 分支线更新 tauri / tauri-build，再同步 npm 包。')
  console.log('更新单个 Tauri 插件：输入插件名和版本，保持 tauri-plugin-* 与 @tauri-apps/plugin-* exact version 一致。')
}

runCommandEntry(import.meta.url, runTauriDeps)
