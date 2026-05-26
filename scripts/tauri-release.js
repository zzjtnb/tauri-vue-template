#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs'
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { emitKeypressEvents } from 'node:readline'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const releaseDir = resolve(root, 'release')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const packageScripts = packageJson.scripts ?? {}

const desktopTargets = [
  {
    name: 'macos',
    label: 'macOS',
    script: 'mac:build',
    outputs: [
      'src-tauri/target/release/bundle',
      'src-tauri/target/universal-apple-darwin/release/bundle',
      'src-tauri/target/aarch64-apple-darwin/release/bundle',
      'src-tauri/target/x86_64-apple-darwin/release/bundle',
    ],
    extensions: ['.app', '.dmg'],
    recommendedOn: ['darwin'],
  },
  {
    name: 'windows',
    label: 'Windows',
    script: 'windows:build',
    outputs: ['src-tauri/target/x86_64-pc-windows-msvc/release/bundle'],
    extensions: ['.exe', '.msi'],
    recommendedOn: ['win32'],
  },
  {
    name: 'linux',
    label: 'Linux',
    script: 'linux:build',
    outputs: ['src-tauri/target/x86_64-unknown-linux-gnu/release/bundle'],
    extensions: ['.appimage', '.deb', '.rpm'],
    recommendedOn: ['linux'],
  },
]

const mobileTargets = [
  {
    name: 'android',
    label: 'Android',
    script: 'android:build',
    outputs: ['src-tauri/gen/android/app/build/outputs'],
    extensions: ['.aab', '.apk'],
  },
  {
    name: 'ios',
    label: 'iOS',
    script: 'ios:build',
    outputs: ['src-tauri/gen/apple/build'],
    extensions: ['.app', '.ipa', '.xcarchive'],
    onlyOn: 'darwin',
  },
  {
    name: 'harmony',
    label: 'OpenHarmony',
    script: 'harmony:build',
    outputs: ['src-tauri/gen/ohos'],
    extensions: ['.app', '.hap', '.har'],
  },
]

const signableUpdaterExtensions = ['.tar.gz', '.zip']
const updaterExtensions = [...signableUpdaterExtensions, '.sig']

const canStyle = process.stdout.isTTY && !process.env.NO_COLOR
const color = {
  accent: value => paint(value, '\x1B[36m'),
  bold: value => paint(value, '\x1B[1m'),
  dim: value => paint(value, '\x1B[2m'),
  inverse: value => paint(value, '\x1B[7m'),
  success: value => paint(value, '\x1B[32m'),
  warn: value => paint(value, '\x1B[33m'),
}

function paint(value, code) {
  return canStyle ? `${code}${value}\x1B[0m` : value
}

function configuredTargets() {
  return [...desktopTargets, ...mobileTargets]
    .filter(target => !target.onlyOn || target.onlyOn === process.platform)
}

function platformHint(target) {
  if (!target.recommendedOn || target.recommendedOn.includes(process.platform))
    return ''

  return `；建议在 ${target.recommendedOn.join(' / ')} 环境执行`
}

function scriptCommand(script) {
  return packageScripts[script]
}

function assertPackageScript(script) {
  if (scriptCommand(script))
    return

  console.error(color.warn(`! package.json 中不存在脚本：${script}`))
  console.error(color.dim('发布工具只允许调用 package.json scripts，请先在 package.json 中维护该命令。'))
  process.exit(1)
}

function assertTargetScripts(targets) {
  for (const target of targets)
    assertPackageScript(target.script)
}

function commandArg(value) {
  return /^[\w./:@+=,-]+$/.test(value)
    ? value
    : `'${value.replaceAll('\'', `'\\''`)}'`
}

function formatCommand(parts) {
  return parts.map(commandArg).join(' ')
}

function runPackageScript(script) {
  runPackageScriptWithArgs(script)
}

function runPackageScriptWithArgs(script, args = []) {
  assertPackageScript(script)

  const pnpmArgs = ['run', script]
  const displayArgs = args.length > 0 ? ['--', ...args] : []

  if (args.length > 0)
    pnpmArgs.push('--', ...args)

  const command = args.length > 0
    ? `${scriptCommand(script)} ${formatCommand(args)}`
    : scriptCommand(script)

  console.log(`${color.accent('脚本')} ${formatCommand(['pnpm', script, ...displayArgs])}`)
  console.log(`${color.dim('命令')} ${command}`)

  const result = spawnSync('pnpm', pnpmArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  })

  if (result.status !== 0)
    process.exit(result.status ?? 1)
}

function ensureReleaseDir() {
  mkdirSync(releaseDir, { recursive: true })
}

function resetReleaseDir() {
  rmSync(releaseDir, { recursive: true, force: true })
  ensureReleaseDir()
  console.log(`${color.success('✓')} 已清空并重建 ${color.accent('release/')}`)
}

function hasSupportedExtension(path, extensions) {
  const lowerPath = path.toLowerCase()
  return extensions.some(extension => lowerPath.endsWith(extension))
}

function collectArtifacts(rootDir, extensions) {
  if (!existsSync(rootDir))
    return []

  const artifacts = []

  function walk(currentPath) {
    const currentStat = statSync(currentPath)

    if (currentStat.isDirectory() && hasSupportedExtension(currentPath, extensions)) {
      artifacts.push(currentPath)
      return
    }

    if (!currentStat.isDirectory()) {
      if (hasSupportedExtension(currentPath, extensions))
        artifacts.push(currentPath)
      return
    }

    for (const entry of readdirSync(currentPath))
      walk(join(currentPath, entry))
  }

  walk(rootDir)
  return artifacts
}

function uniqueDestination(targetDir, artifactPath) {
  const artifactName = basename(artifactPath)
  const extension = extname(artifactName)
  const stem = extension ? artifactName.slice(0, -extension.length) : artifactName
  let destination = join(targetDir, artifactName)
  let index = 1

  while (existsSync(destination)) {
    destination = join(targetDir, `${stem}-${index}${extension}`)
    index += 1
  }

  return destination
}

function normalizeInputPath(value) {
  const trimmed = value.trim()

  if (trimmed === '~')
    return process.env.HOME || trimmed

  if (trimmed.startsWith('~/'))
    return process.env.HOME ? join(process.env.HOME, trimmed.slice(2)) : trimmed

  return trimmed
}

function absoluteInputPath(value) {
  const normalized = normalizeInputPath(value)
  return isAbsolute(normalized) ? normalized : resolve(root, normalized)
}

function projectRelativePath(path) {
  const relativePath = relative(root, path)

  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath))
    return path

  return relativePath
}

async function promptText(label, defaultValue = '') {
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  try {
    const suffix = defaultValue ? ` (${defaultValue})` : ''
    const answer = await rl.question(`${label}${suffix}: `)
    return answer.trim() || defaultValue
  }
  finally {
    rl.close()
  }
}

function moveArtifact(artifactPath, destination) {
  mkdirSync(dirname(destination), { recursive: true })

  try {
    renameSync(artifactPath, destination)
  }
  catch (error) {
    if (error.code !== 'EXDEV')
      throw error

    cpSync(artifactPath, destination, { recursive: true })
    rmSync(artifactPath, { recursive: true, force: true })
  }
}

function checkMacSignature(artifactPath) {
  const isApp = artifactPath.endsWith('.app')
  const isDmg = artifactPath.endsWith('.dmg')

  if (process.platform !== 'darwin' || (!isApp && !isDmg))
    return

  const args = isApp
    ? ['--verify', '--deep', '--strict', artifactPath]
    : ['--verify', '--strict', artifactPath]
  const result = spawnSync('codesign', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.status === 0) {
    console.log(`${color.success('✓')} 签名检查通过：${relative(root, artifactPath)}`)
    return
  }

  console.log(`${color.warn('!')} 未签名或签名校验失败：${relative(root, artifactPath)}`)
  console.log(color.dim('  这通常表示当前 package.json 构建命令没有配置 Apple Developer 签名身份、entitlements 或 notarization 流程。'))
}

function moveTargetArtifacts(target, { failWhenEmpty = true } = {}) {
  ensureReleaseDir()

  const targetDir = join(releaseDir, target.name)
  const artifacts = target.outputs.flatMap(output => collectArtifacts(resolve(root, output), target.extensions))

  if (artifacts.length === 0) {
    const message = `${target.label} 未发现可移动产物`

    if (failWhenEmpty) {
      console.error(color.warn(`! ${message}，请先打包或检查输出路径配置`))
      process.exit(1)
    }

    console.log(`${color.warn('!')} ${message}`)
    return 0
  }

  for (const artifact of artifacts) {
    const destination = uniqueDestination(targetDir, artifact)
    moveArtifact(artifact, destination)
    console.log(`${color.success('✓')} ${target.label}: ${relative(root, destination)}`)
    checkMacSignature(destination)
  }

  return artifacts.length
}

function moveTargetUpdaterArtifacts(target) {
  ensureReleaseDir()

  const targetDir = join(releaseDir, 'updater', target.name)
  const artifacts = target.outputs.flatMap(output => collectArtifacts(resolve(root, output), updaterExtensions))

  if (artifacts.length === 0)
    return 0

  for (const artifact of artifacts) {
    const destination = uniqueDestination(targetDir, artifact)
    moveArtifact(artifact, destination)
    console.log(`${color.success('✓')} ${target.label} updater: ${relative(root, destination)}`)
  }

  return artifacts.length
}

function moveAllArtifacts({ failWhenEmpty = false } = {}) {
  let count = 0

  for (const target of configuredTargets()) {
    count += moveTargetArtifacts(target, { failWhenEmpty: false })
    count += moveTargetUpdaterArtifacts(target)
  }

  if (count === 0 && failWhenEmpty) {
    console.error(color.warn('! 未发现任何可移动产物，请先选择打包目标'))
    process.exit(1)
  }

  console.log('')
  console.log(`${color.success('release 目录')}：${relative(root, releaseDir)}`)
}

function collectSignableUpdaterArtifacts() {
  return collectArtifacts(join(releaseDir, 'updater'), signableUpdaterExtensions)
}

function printSigningCandidates(artifacts) {
  if (artifacts.length === 0)
    return

  console.log(color.accent('候选 updater 更新包：'))
  for (const artifact of artifacts)
    console.log(`  ${color.dim(projectRelativePath(artifact))}`)
  console.log('')
}

async function signUpdaterArtifacts() {
  assertPackageScript('tauri:signer')
  ensureReleaseDir()

  const artifacts = collectSignableUpdaterArtifacts()
  const defaultArtifact = artifacts.length === 1
    ? projectRelativePath(artifacts[0])
    : artifacts.length > 1 ? 'all' : ''

  printSigningCandidates(artifacts)

  const artifactInput = await promptText('输入 updater 更新包路径；输入 all 签名全部候选', defaultArtifact)

  if (!artifactInput) {
    console.log(color.warn('! 未输入 updater 更新包路径，已取消签名'))
    return
  }

  const selectedArtifacts = artifactInput.toLowerCase() === 'all'
    ? artifacts
    : [absoluteInputPath(artifactInput)]

  if (selectedArtifacts.length === 0) {
    console.log(color.warn('! release/ 中没有可签名的 updater 更新包'))
    return
  }

  for (const artifact of selectedArtifacts) {
    if (!existsSync(artifact) || statSync(artifact).isDirectory()) {
      console.error(color.warn(`! updater 更新包不存在或不是文件：${artifact}`))
      process.exit(1)
    }
  }

  const hasSigningKeyEnv = process.env.TAURI_SIGNING_PRIVATE_KEY || process.env.TAURI_SIGNING_PRIVATE_KEY_PATH
  const privateKeyInput = hasSigningKeyEnv
    ? ''
    : await promptText('可选：私钥文件路径，留空则使用环境变量或 CLI 默认行为')
  const privateKeyPath = privateKeyInput ? normalizeInputPath(privateKeyInput) : ''

  if (privateKeyPath && !existsSync(absoluteInputPath(privateKeyPath))) {
    console.error(color.warn(`! 私钥文件不存在：${privateKeyPath}`))
    process.exit(1)
  }

  console.log(color.dim('密码请通过 TAURI_SIGNING_PRIVATE_KEY_PASSWORD 注入；脚本不会读取或打印密码。'))

  for (const artifact of selectedArtifacts) {
    const args = ['sign', projectRelativePath(artifact)]

    if (privateKeyPath)
      args.push('-f', privateKeyPath)

    runPackageScriptWithArgs('tauri:signer', args)
  }
}

function buildTarget(target) {
  assertTargetScripts([target])

  console.log('')
  console.log(`${color.accent('==>')} 打包 ${target.label}`)
  runPackageScript(target.script)
  moveTargetArtifacts(target)
  moveTargetUpdaterArtifacts(target)
}

function buildAllTargets() {
  const targets = configuredTargets()
  assertTargetScripts(targets)
  resetReleaseDir()

  for (const target of targets)
    buildTarget(target)

  console.log('')
  console.log(`${color.success('release 目录')}：${relative(root, releaseDir)}`)
}

function renderMenuHeader() {
  console.log(color.accent('╭──────────────────────────────────────────────╮'))
  console.log(`${color.accent('│')} ${color.bold('Tauri 发布工具')}`)
  console.log(`${color.accent('│')} ${color.dim('只调用 package.json scripts，收集产物到 release/，并辅助 updater 签名')}`)
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
    const label = isSelected ? color.inverse(` ${item.label} `) : item.label

    console.log(` ${marker} ${label}`)

    if (isSelected)
      console.log(`   ${color.success('└')} ${color.dim(item.description)}`)
  }

  console.log('')
}

function selectMenu(items) {
  if (!process.stdin.isTTY) {
    console.error('当前终端不支持交互菜单，请在可交互终端执行 pnpm tauri:release')
    process.exit(1)
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

function buildMenuItems() {
  const targetItems = configuredTargets().map(target => ({
    label: `打包 ${target.label} 并移动到 release/`,
    description: `执行 package.json 脚本 pnpm ${target.script}，然后移动 ${target.extensions.join(' / ')} 产物${platformHint(target)}；如存在 updater 更新包也会移动到 release/updater/${target.name}/。`,
    run: () => buildTarget(target),
  }))

  return [
    ...targetItems,
    {
      label: '打包全部可用平台并移动到 release/',
      description: '依次执行 package.json 中的可用平台脚本；执行前会清空 release/。',
      run: buildAllTargets,
    },
    {
      label: '只移动已有打包产物到 release/',
      description: '不执行打包命令，只递归收集当前已有平台产物和 updater 更新包并移动到 release/。',
      run: () => moveAllArtifacts({ failWhenEmpty: true }),
    },
    {
      label: '签名 updater 更新包',
      description: '调用 package.json 脚本 pnpm tauri:signer -- sign <文件>；私钥通过环境变量或私钥文件路径提供。',
      run: signUpdaterArtifacts,
    },
    {
      label: '清空 release/',
      description: '删除根目录 release/ 并重新创建空目录。',
      run: resetReleaseDir,
    },
    {
      label: '退出',
      description: '不执行任何操作。',
      run: () => process.exit(0),
    },
  ]
}

async function showMenu() {
  assertTargetScripts(configuredTargets())

  const selectedItem = await selectMenu(buildMenuItems())
  console.log('')
  await selectedItem.run()
}

await showMenu()
