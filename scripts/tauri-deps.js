#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { createInterface, emitKeypressEvents } from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJsonPath = resolve(root, 'package.json')
const cargoManifestPath = resolve(root, 'src-tauri/Cargo.toml')
const cargoLockPath = resolve(root, 'src-tauri/Cargo.lock')

const results = []

function pass(message) {
  results.push({ level: 'pass', message })
}

function warn(message) {
  results.push({ level: 'warn', message })
}

function fail(message) {
  results.push({ level: 'fail', message })
}

function run(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
    stdio: options.inherit
      ? ['ignore', 'inherit', 'inherit']
      : options.silent
        ? ['ignore', 'ignore', 'pipe']
        : ['ignore', 'pipe', 'pipe'],
  })

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

function runOrExit(commandName, args, options = {}) {
  const result = run(commandName, args, options)

  if (result.status !== 0)
    exitWithResults(1)

  return result
}

function cleanVersion(version) {
  return version?.replace(/^[~^=]/, '')
}

function parseVersion(version) {
  const normalized = cleanVersion(version)
  const match = normalized?.match(/^(\d+)\.(\d+)\.(\d+)/)

  if (!match) {
    throw new Error(`无法解析版本号：${version}`)
  }

  return {
    raw: normalized,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

function hasSameMinor(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  return a.major === b.major && a.minor === b.minor
}

function sameMinorTarget(version) {
  const parsed = parseVersion(version)
  return `${parsed.major}.${parsed.minor}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readPackageJson() {
  return JSON.parse(readFileSync(packageJsonPath, 'utf8'))
}

function npmPackagesFrom(packageJson) {
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
}

function npmPluginEntries(npmPackages) {
  return Object.entries(npmPackages)
    .filter(([name]) => name.startsWith('@tauri-apps/plugin-'))
    .map(([name, version]) => ({
      npmName: name,
      npmVersion: cleanVersion(version),
      cargoName: `tauri-plugin-${name.replace('@tauri-apps/plugin-', '')}`,
    }))
}

function readCargoPackages() {
  return parseCargoLock(readFileSync(cargoLockPath, 'utf8'))
}

function parseCargoLock(content) {
  const packages = []
  let current = null

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
    if (!field)
      continue

    current[field[1]] = field[2]
  }

  if (current)
    packages.push(current)
  return packages
}

function findCargoPackage(packages, name) {
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
    const prefix = result.level === 'pass'
      ? '✓'
      : result.level === 'warn'
        ? '!'
        : '✗'

    console.log(`${prefix} ${result.message}`)
  }
}

function hasFailures() {
  return results.some(result => result.level === 'fail')
}

function resetResults() {
  results.length = 0
}

function printResultSummary() {
  if (results.length === 0)
    return

  console.log('')
  printResults()
}

function exitWithResults(code = hasFailures() ? 1 : 0) {
  printResultSummary()
  process.exit(code)
}

function finishAndCheck() {
  printResultSummary()
  console.log('')
  console.log('继续执行 check 确认同步结果。')
  console.log('')

  resetResults()
  checkDependencies()
}

function printHeader(title, description) {
  console.log(title)
  console.log(description)
  console.log('')
}

function checkSameMinor(npmName, npmVersion, cargoName, cargoVersion) {
  try {
    if (hasSameMinor(npmVersion, cargoVersion)) {
      pass(`${npmName} ${cleanVersion(npmVersion)} 与 ${cargoName} ${cargoVersion} 保持同 minor`)
    }
    else {
      fail(`${npmName} ${cleanVersion(npmVersion)} 与 ${cargoName} ${cargoVersion} minor 不一致`)
    }
  }
  catch (error) {
    fail(error.message)
  }
}

function checkInstalledNpmPlugins(pluginEntries, cargoPackages) {
  for (const plugin of pluginEntries) {
    const cargoPackage = findCargoPackage(cargoPackages, plugin.cargoName)

    if (!cargoPackage) {
      fail(`${plugin.npmName} 已安装，但 Cargo.lock 中未找到 ${plugin.cargoName}`)
      continue
    }

    if (plugin.npmVersion === cargoPackage.version) {
      pass(`${plugin.npmName} ${plugin.npmVersion} 与 ${plugin.cargoName} ${cargoPackage.version} 完全一致`)
    }
    else {
      fail(`${plugin.npmName} ${plugin.npmVersion} 与 ${plugin.cargoName} ${cargoPackage.version} 不一致`)
    }
  }
}

function warnRustOnlyPlugins(pluginEntries, cargoPackages) {
  const installedNpmPluginNames = new Set(pluginEntries.map(plugin => plugin.cargoName))

  for (const cargoPackage of cargoPackages.filter(pkg => pkg.name?.startsWith('tauri-plugin-'))) {
    if (!installedNpmPluginNames.has(cargoPackage.name))
      warn(`${cargoPackage.name} ${cargoPackage.version} 只有 Rust 侧存在；如果前端不导入对应 @tauri-apps/plugin-*，这是允许的`)
  }
}

function checkDependencies() {
  printHeader('Tauri 依赖同步检查', '说明：本脚本检查 npm 包和 Cargo crate 是否同步，不判断是否为全网 latest。')

  assertOpenHarmonyLine()

  const metadataResult = run('cargo', ['metadata', '--manifest-path', cargoManifestPath, '--locked', '--format-version', '1'], { silent: true })
  if (metadataResult.status === 0) {
    pass('Cargo.toml 与 Cargo.lock 一致')
  }

  const tauriInfoResult = run('pnpm', ['tauri', 'info'], { allowFailure: true })
  if (tauriInfoResult.status === 0) {
    pass('pnpm tauri info 未报告版本 mismatch')
  }
  else {
    fail('pnpm tauri info 报告版本 mismatch 或执行失败')
    if (tauriInfoResult.stdout)
      process.stdout.write(tauriInfoResult.stdout)
    if (tauriInfoResult.stderr)
      process.stderr.write(tauriInfoResult.stderr)
  }

  const packageJson = readPackageJson()
  const npmPackages = npmPackagesFrom(packageJson)
  const cargoPackages = readCargoPackages()
  const tauri = findCargoPackage(cargoPackages, 'tauri')
  const apiVersion = npmPackages['@tauri-apps/api']

  if (!tauri) {
    fail('Cargo.lock 中未找到 tauri crate')
  }
  else if (!apiVersion) {
    fail('package.json 中未安装 @tauri-apps/api')
  }
  else {
    checkSameMinor('@tauri-apps/api', apiVersion, 'tauri', tauri.version)
  }

  const cliVersion = npmPackages['@tauri-apps/cli']
  if (tauri && cliVersion) {
    try {
      if (hasSameMinor(cliVersion, tauri.version)) {
        pass(`@tauri-apps/cli ${cleanVersion(cliVersion)} 与 tauri ${tauri.version} 保持同 minor`)
      }
      else {
        warn(`@tauri-apps/cli ${cleanVersion(cliVersion)} 与 tauri ${tauri.version} minor 不一致；如 pnpm tauri info 未报错，可按当前工程兼容版本处理`)
      }
    }
    catch (error) {
      fail(error.message)
    }
  }

  const pluginEntries = npmPluginEntries(npmPackages)
  checkInstalledNpmPlugins(pluginEntries, cargoPackages)
  warnRustOnlyPlugins(pluginEntries, cargoPackages)

  exitWithResults()
}

function resolveNpmVersion(packageName, minorTarget) {
  const result = run('pnpm', ['view', `${packageName}@${minorTarget}`, 'version', '--json'], { allowFailure: true })

  if (result.status !== 0) {
    fail(`无法查询 ${packageName}@${minorTarget}；请手动指定兼容版本后重新执行`)
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

function collectNpmSyncActions() {
  const packageJson = readPackageJson()
  const npmPackages = npmPackagesFrom(packageJson)
  const cargoPackages = readCargoPackages()
  const actions = []
  const tauri = findCargoPackage(cargoPackages, 'tauri')

  if (!tauri) {
    fail('Cargo.lock 中未找到 tauri crate，无法同步 npm 包')
    return actions
  }

  const apiVersion = npmPackages['@tauri-apps/api']
  if (!apiVersion || !hasSameMinor(apiVersion, tauri.version)) {
    const targetVersion = resolveNpmVersion('@tauri-apps/api', sameMinorTarget(tauri.version))
    if (targetVersion) {
      actions.push({ dev: false, packageName: '@tauri-apps/api', version: targetVersion })
    }
  }

  const cliVersion = npmPackages['@tauri-apps/cli']
  if (cliVersion && !hasSameMinor(cliVersion, tauri.version)) {
    const targetVersion = resolveNpmVersion('@tauri-apps/cli', sameMinorTarget(tauri.version))
    if (targetVersion) {
      actions.push({ dev: true, packageName: '@tauri-apps/cli', version: targetVersion })
    }
  }

  for (const plugin of npmPluginEntries(npmPackages)) {
    const cargoPackage = findCargoPackage(cargoPackages, plugin.cargoName)

    if (!cargoPackage) {
      fail(`${plugin.npmName} 已安装，但 Cargo.lock 中未找到 ${plugin.cargoName}`)
      continue
    }

    if (plugin.npmVersion !== cargoPackage.version)
      actions.push({ dev: false, packageName: plugin.npmName, version: cargoPackage.version })
  }

  return actions
}

function runPnpmAdd(action) {
  const args = ['add', '-E', `${action.packageName}@${action.version}`]
  if (action.dev)
    args.splice(1, 0, '-D')
  runOrExit('pnpm', args, { inherit: true })
}

function syncNpmPackages() {
  const actions = collectNpmSyncActions()

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

function updateOpenHarmonyLine() {
  printHeader('Tauri 依赖更新', '说明：按 OpenHarmony feat/open-harmony 分支版本线更新后端核心依赖，再同步 npm 包。')

  assertOpenHarmonyLine({ exitOnFailure: true })

  runOrExit('cargo', ['update', '--manifest-path', cargoManifestPath, '-p', 'tauri', '-p', 'tauri-build'], { inherit: true })
  pass('已更新或确认 OpenHarmony 分支上的 tauri / tauri-build')

  syncNpmPackages()

  runOrExit('pnpm', ['install'], { inherit: true })
  pass('pnpm install 已完成')

  finishAndCheck()
}

function normalizePluginName(name) {
  return name
    .replace(/^@tauri-apps\/plugin-/, '')
    .replace(/^tauri-plugin-/, '')
}

function assertVersion(version) {
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Z.-]+)?$/i.test(version)) {
    fail(`插件版本必须是明确 semver，例如 2.5.1；当前收到：${version}`)
    exitWithResults(1)
  }
}

function updateCargoPluginVersion(cargoName, version) {
  const content = readFileSync(cargoManifestPath, 'utf8')
  const escapedName = escapeRegExp(cargoName)
  let count = 0

  let nextContent = content.replace(new RegExp(`(^\\s*${escapedName}\\s*=\\s*)"[^"]+"`, 'gm'), (_, prefix) => {
    count += 1
    return `${prefix}"${version}"`
  })

  if (count === 0) {
    nextContent = nextContent.replace(new RegExp(`(^\\s*${escapedName}\\s*=\\s*\\{[^\\n}]*version\\s*=\\s*)"[^"]+"`, 'gm'), (_, prefix) => {
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

function updatePlugin(args) {
  printHeader('Tauri 插件依赖更新', '说明：显式更新单个插件的 Rust crate，再同步已安装的 npm 插件包 exact version。')

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

  const packageJson = readPackageJson()
  const npmPackages = npmPackagesFrom(packageJson)
  if (npmPackages[npmName]) {
    runPnpmAdd({ dev: false, packageName: npmName, version })
    pass(`${npmName} 已同步到 ${version}`)
  }
  else {
    warn(`${npmName} 未安装；如果前端不导入该插件，这是允许的。需要前端 API 时请安装 ${npmName}@${version}`)
  }

  runOrExit('pnpm', ['install'], { inherit: true })
  pass('pnpm install 已完成')

  finishAndCheck()
}

const canStyle = process.stdout.isTTY && !process.env.NO_COLOR
const color = {
  accent: value => paint(value, '\x1B[36m'),
  bold: value => paint(value, '\x1B[1m'),
  dim: value => paint(value, '\x1B[2m'),
  inverse: value => paint(value, '\x1B[7m'),
  success: value => paint(value, '\x1B[32m'),
}

function paint(value, code) {
  return canStyle ? `${code}${value}\x1B[0m` : value
}

function renderMenuHeader() {
  console.log(color.accent('╭──────────────────────────────────────────────╮'))
  console.log(`${color.accent('│')} ${color.bold('Tauri 依赖工具')}`)
  console.log(`${color.accent('│')} ${color.dim('OpenHarmony feat/open-harmony 版本线')}`)
  console.log(color.accent('╰──────────────────────────────────────────────╯'))
  console.log('')
  console.log(`${color.dim('↑/↓')} 选择   ${color.dim('Enter')} 执行   ${color.dim('q / Esc')} 退出`)
  console.log('')
}

function renderMenu(items, selectedIndex) {
  process.stdout.write('\x1B[2J\x1B[H')
  renderMenuHeader()

  for (const [index, item] of items.entries()) {
    const isSelected = index === selectedIndex
    const marker = isSelected ? color.accent('❯') : color.dim(' ')
    const label = isSelected
      ? color.inverse(` ${item.label} `)
      : item.label

    console.log(` ${marker} ${label}`)

    if (isSelected)
      console.log(`   ${color.success('└')} ${color.dim(item.description)}`)
  }

  console.log('')
}

function selectMenu(items) {
  if (!process.stdin.isTTY) {
    fail('当前终端不支持交互菜单，请在可交互终端执行 pnpm tauri:deps')
    exitWithResults(1)
  }

  return new Promise((resolve) => {
    let selectedIndex = 0

    emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()

    let cleanup = () => {}

    const onKeypress = (_, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        cleanup()
        process.exit(0)
      }

      if (key.name === 'q' || key.name === 'escape') {
        cleanup()
        process.exit(0)
      }

      if (key.name === 'up') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length
        renderMenu(items, selectedIndex)
        return
      }

      if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % items.length
        renderMenu(items, selectedIndex)
        return
      }

      if (key.name === 'return') {
        const selectedItem = items[selectedIndex]
        cleanup()
        resolve(selectedItem)
      }
    }

    cleanup = () => {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.off('keypress', onKeypress)
    }

    process.stdin.on('keypress', onKeypress)
    renderMenu(items, selectedIndex)
  })
}

function askText(question) {
  const reader = createInterface({ input: process.stdin, output: process.stdout })

  return new Promise((resolve) => {
    reader.question(`${color.accent('?')} ${question} `, (answer) => {
      reader.close()
      resolve(answer.trim())
    })
  })
}

async function updatePluginFromMenu() {
  const plugin = await askText('插件名称，例如 fs：')
  const version = await askText('目标版本，例如 2.5.1：')
  updatePlugin([plugin, version])
}

async function showMenu() {
  const items = [
    {
      label: '检查 Tauri 依赖同步',
      description: '只检查 npm 包和 Cargo crate 是否同步，不自动修改依赖。',
      run: checkDependencies,
    },
    {
      label: '更新 OpenHarmony 核心并同步 npm',
      description: '先更新 tauri / tauri-build 的 OpenHarmony 分支锁定结果，再按 Cargo 实际版本同步 npm。',
      run: updateOpenHarmonyLine,
    },
    {
      label: '更新单个 Tauri 插件',
      description: '输入插件名和版本，保持 tauri-plugin-* 与 @tauri-apps/plugin-* exact version 一致。',
      run: updatePluginFromMenu,
    },
    {
      label: '查看菜单说明',
      description: '说明每个菜单项会执行什么操作。',
      run: () => {
        printMenuHelp()
        process.exit(0)
      },
    },
    {
      label: '退出',
      description: '不执行任何操作。',
      run: () => process.exit(0),
    },
  ]

  const selectedItem = await selectMenu(items)
  console.log('')
  await selectedItem.run()
}

function printMenuHelp() {
  console.log(color.accent('╭──────────────────────────────────────────────╮'))
  console.log(`${color.accent('│')} ${color.bold('Tauri 依赖工具')}`)
  console.log(color.accent('╰──────────────────────────────────────────────╯'))
  console.log('')
  console.log(`${color.bold('入口')}`)
  console.log(`  ${color.accent('pnpm tauri:deps')}`)
  console.log('')
  console.log(`${color.bold('菜单项')}`)
  console.log(`  ${color.accent('检查 Tauri 依赖同步')}`)
  console.log(`    ${color.dim('只检查 npm 包和 Cargo crate 是否同步，不自动修改依赖。')}`)
  console.log('')
  console.log(`  ${color.accent('更新 OpenHarmony 核心并同步 npm')}`)
  console.log(`    ${color.dim('按 OpenHarmony feat/open-harmony 分支线更新 tauri / tauri-build，再同步 npm 包。')}`)
  console.log('')
  console.log(`  ${color.accent('更新单个 Tauri 插件')}`)
  console.log(`    ${color.dim('输入插件名和版本，保持 tauri-plugin-* 与 @tauri-apps/plugin-* exact version 一致。')}`)
}

await showMenu()
