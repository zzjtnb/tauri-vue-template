/**
 * 按选中的 Tauri 目标同步移动端生成工程元信息。
 *
 * Tauri 移动端生成器会把平台工程放在 `src-tauri/gen/**` 下，而这些文件同一时间
 * 只能代表一个应用目标。因此本命令拒绝 `--target all`，并且必须解析到单个目标后
 * 才会修改 Android、iOS 或 OpenHarmony 文件。
 */
import type { JsonRecord, TauriConfig } from '#/types/tauri.ts'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { log } from '@clack/prompts'
import { assertInsidePath, findFiles, pruneEmptyDirs, readJson, removePath, toRelativePath, writeJsonIfChanged as writeJsonFileIfChanged, writeTextIfChanged } from '@tauri-vue-template/utils/node'
import { defaultTarget, promptSingleTargetName, readEffectiveTauriConfig, resolveAppTargets } from '#/tauri/target.ts'
import { runCommandEntry, srcTauriRoot, workspaceRoot } from '#/utils.ts'

interface OpenHarmonyStringResource {
  string?: Array<{
    name?: unknown
    value?: unknown
  }>
}

interface SyncTarget {
  identifier: string
  productName: string
  title: string
  version: string
}

const sourceConfigPath = resolve(srcTauriRoot, 'tauri.conf.json')
const genRoot = resolve(srcTauriRoot, 'gen')
const changes: string[] = []
const warnings: string[] = []

export async function runTauriSync(rawArgs: string[] = []) {
  changes.length = 0
  warnings.length = 0

  const targetName = isInteractiveRequest(rawArgs)
    ? await promptSingleTargetName('选择要同步到 src-tauri/gen/** 的应用目标')
    : parseArgs(rawArgs)

  if (!targetName)
    return

  const appTarget = resolveSyncTarget(targetName)
  const config = readEffectiveTauriConfig(appTarget) as TauriConfig
  const target = resolveTarget(config, appTarget.configSource)

  syncAndroid(target)
  syncApple(target)
  syncOpenHarmony(target, config)

  for (const warning of warnings)
    log.warn(warning)

  if (changes.length === 0) {
    log.success(`Tauri 生成工程元信息已是最新：${appTarget.name}。`)
    return
  }

  for (const change of changes)
    log.success(change)

  log.success(`已同步 Tauri 生成工程元信息：${appTarget.name} / ${target.productName} / ${target.identifier}`)
}

function isInteractiveRequest(args: string[]) {
  return args.every(arg => arg === '--')
}

function parseArgs(args: string[]) {
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

    throw new Error(`未知参数：${arg}`)
  }

  return targetName
}

function resolveSyncTarget(targetName: string) {
  if (targetName === 'all')
    throw new Error('src-tauri/gen/** 同一时间只能代表一个移动端目标，请指定单个 --target。')

  const targets = resolveAppTargets(targetName)
  if (targets.length !== 1)
    throw new Error('src-tauri/gen/** 同一时间只能代表一个移动端目标，请指定单个 --target。')

  return targets[0]
}

function requiredValue(args: string[], index: number, name: string) {
  const value = args[index + 1]
  if (!value)
    throw new Error(`${name} 缺少参数值。`)

  return value
}

function resolveTarget(config: TauriConfig, configSource = sourceConfigPath): SyncTarget {
  const productName = requiredString(config.productName, 'productName', configSource)
  const windowTitle = config.app?.windows?.[0]?.title

  return {
    productName,
    identifier: requiredString(config.identifier, 'identifier', configSource),
    version: requiredString(config.version, 'version', configSource),
    title: typeof windowTitle === 'string' && windowTitle.length > 0 ? windowTitle : productName,
  }
}

function requiredString(value: unknown, key: string, configSource: string) {
  if (typeof value !== 'string' || value.length === 0)
    throw new Error(`${configSource} 缺少必要字段：${key}`)

  return value
}

function syncAndroid(target: SyncTarget) {
  const androidRoot = resolve(genRoot, 'android')
  if (!existsSync(androidRoot)) {
    warnings.push('跳过 Android：src-tauri/gen/android 不存在。')
    return
  }

  replaceInFile(resolve(androidRoot, 'app/build.gradle.kts'), [
    [/namespace = "[^"]+"/, `namespace = "${target.identifier}"`],
    [/applicationId = "[^"]+"/, `applicationId = "${target.identifier}"`],
  ])
  replaceInFile(resolve(androidRoot, 'app/src/main/res/values/strings.xml'), [
    [/<string name="app_name">.*<\/string>/, `<string name="app_name">${escapeXml(target.productName)}</string>`],
    [/<string name="main_activity_title">.*<\/string>/, `<string name="main_activity_title">${escapeXml(target.title)}</string>`],
  ])
  syncAndroidActivityPackage(androidRoot, target.identifier)
  pruneAndroidJavaPackageSiblings(androidRoot, target.identifier)
}

function syncAndroidActivityPackage(androidRoot: string, identifier: string) {
  const javaRoot = resolve(androidRoot, 'app/src/main/java')
  if (!existsSync(javaRoot)) {
    warnings.push('跳过 Android MainActivity：app/src/main/java 不存在。')
    return
  }

  const activityFiles = findFiles(javaRoot, file => file.endsWith('/MainActivity.kt'))
  if (activityFiles.length === 0) {
    warnings.push('跳过 Android MainActivity：未找到 MainActivity.kt。')
    return
  }

  assertAndroidPackageIdentifier(identifier)
  const targetDir = assertInsidePath({ label: 'Android Java 包目录', rootDir: javaRoot, targetPath: identifier.split('.').join('/') })
  const targetFile = resolve(targetDir, 'MainActivity.kt')
  const sourceFile = activityFiles.includes(targetFile) ? targetFile : activityFiles[0]
  const content = readFileSync(sourceFile, 'utf8').replace(/^package\s+[^\n]+/m, `package ${identifier}`)

  mkdirSync(targetDir, { recursive: true })
  writeIfChanged(targetFile, content)

  for (const activityFile of activityFiles) {
    if (activityFile !== targetFile) {
      removePath(activityFile)
      changes.push(`删除旧 Android Activity：${projectRelativePath(activityFile)}`)
    }
  }

  pruneEmptyDirs(javaRoot)
}

/** Android 生成工程同一时间只属于一个 identifier；旧 generated 包会被 Kotlin 一起编译，必须删除。 */
function pruneAndroidJavaPackageSiblings(androidRoot: string, identifier: string) {
  const javaRoot = resolve(androidRoot, 'app/src/main/java')
  if (!existsSync(javaRoot))
    return

  assertAndroidPackageIdentifier(identifier)
  const targetDir = assertInsidePath({ label: 'Android Java 包目录', rootDir: javaRoot, targetPath: identifier.split('.').join('/') })
  const generatedPackageDirs = findGeneratedPackageDirs(javaRoot)

  for (const packageDir of generatedPackageDirs) {
    if (packageDir === targetDir)
      continue

    removePath(packageDir)
    changes.push(`删除旧 Android Java 包目录：${projectRelativePath(packageDir)}`)
  }

  pruneEmptyDirs(javaRoot)
}

function findGeneratedPackageDirs(root: string) {
  const packageDirs: string[] = []

  function walk(currentPath: string) {
    for (const entry of readdirSync(currentPath)) {
      const entryPath = resolve(currentPath, entry)
      if (!statSync(entryPath).isDirectory())
        continue

      if (entry === 'generated') {
        packageDirs.push(currentPath)
        continue
      }

      walk(entryPath)
    }
  }

  walk(root)
  return packageDirs
}

/** Android MainActivity 路径由 identifier 推导，必须先限制为 Java 包名，避免路径穿越。 */
function assertAndroidPackageIdentifier(identifier: string) {
  if (!/^[A-Z]\w*(?:\.[A-Z]\w*)+$/i.test(identifier))
    throw new Error(`Tauri identifier 必须是可映射为 Android Java 包名的反向域名：${identifier}`)
}

function syncApple(target: SyncTarget) {
  const appleRoot = resolve(genRoot, 'apple')
  if (!existsSync(appleRoot)) {
    warnings.push('跳过 iOS：src-tauri/gen/apple 不存在。')
    return
  }

  replaceInFile(resolve(appleRoot, 'project.yml'), [
    [/bundleIdPrefix: .*/, `bundleIdPrefix: ${target.identifier}`],
    [/PRODUCT_NAME: .*/, `PRODUCT_NAME: ${target.productName}`],
    [/PRODUCT_BUNDLE_IDENTIFIER: .*/, `PRODUCT_BUNDLE_IDENTIFIER: ${target.identifier}`],
  ])
  syncAppleXcodeProject(resolve(appleRoot, 'app.xcodeproj/project.pbxproj'), target)
}

function syncAppleXcodeProject(path: string, target: SyncTarget) {
  if (!existsSync(path)) {
    warnings.push(`跳过不存在文件：${projectRelativePath(path)}`)
    return
  }

  let content = readFileSync(path, 'utf8')
  content = content
    .replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${target.identifier};`)
    .replace(/\/\* [^*]+\.app \*\//g, `/* ${target.productName}.app */`)
    .replace(/path = "[^"]+\.app";/g, `path = "${target.productName}.app";`)

  content = syncAppleProductNames(content, target)
  writeIfChanged(path, content)
}

function syncAppleProductNames(content: string, target: SyncTarget) {
  const lines = content.split('\n')
  let buildSettingsStart = -1
  let hasBundleIdentifier = false
  let productNameIndex = -1

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.includes('buildSettings = {')) {
      buildSettingsStart = index
      hasBundleIdentifier = false
      productNameIndex = -1
      continue
    }

    if (buildSettingsStart === -1)
      continue

    if (line.includes('PRODUCT_BUNDLE_IDENTIFIER ='))
      hasBundleIdentifier = true

    if (line.includes('PRODUCT_NAME ='))
      productNameIndex = index

    if (/^\s+\};$/.test(line)) {
      if (productNameIndex !== -1) {
        lines[productNameIndex] = hasBundleIdentifier
          ? lines[productNameIndex].replace(/PRODUCT_NAME = "[^"]+";/, `PRODUCT_NAME = "${target.productName}";`)
          : lines[productNameIndex].replace(/PRODUCT_NAME = "[^"]+";/, 'PRODUCT_NAME = "$(TARGET_NAME)";')
      }

      buildSettingsStart = -1
      hasBundleIdentifier = false
      productNameIndex = -1
    }
  }

  return lines.join('\n')
}

function syncOpenHarmony(target: SyncTarget, config: TauriConfig) {
  const ohosRoot = resolve(genRoot, 'ohos')
  if (!existsSync(ohosRoot)) {
    warnings.push('跳过 OpenHarmony：src-tauri/gen/ohos 不存在。')
    return
  }

  replaceInFile(resolve(ohosRoot, 'AppScope/app.json5'), [[/"bundleName":\s*"[^"]+"/, `"bundleName": "${target.identifier}"`]])

  const stringJsonPath = resolve(ohosRoot, 'AppScope/resources/base/element/string.json')
  if (existsSync(stringJsonPath)) {
    const strings = readJson<OpenHarmonyStringResource>(stringJsonPath)
    const appName = strings.string?.find(item => item.name === 'app_name')
    if (appName)
      appName.value = target.productName
    writeJsonIfChanged(stringJsonPath, strings)
  }

  const assetsConfigPath = resolve(ohosRoot, 'assets/tauri.conf.json')
  if (existsSync(assetsConfigPath)) {
    const generatedConfig = readJson<TauriConfig>(assetsConfigPath)
    const nextConfig = mergeGeneratedTauriConfig(generatedConfig, config, target)
    writeJsonIfChanged(assetsConfigPath, nextConfig, { compact: true })
  }
}

function mergeGeneratedTauriConfig(generatedConfig: TauriConfig, sourceConfig: TauriConfig, target: SyncTarget): TauriConfig {
  const nextConfig = structuredClone(generatedConfig)
  nextConfig.productName = target.productName
  nextConfig.version = target.version
  nextConfig.identifier = target.identifier
  nextConfig.build = { ...recordValue(nextConfig.build), ...recordValue(sourceConfig.build) }
  nextConfig.app = {
    ...recordValue(nextConfig.app),
    security: sourceConfig.app?.security ?? nextConfig.app?.security,
    windows: sourceConfig.app?.windows ?? nextConfig.app?.windows,
  }
  nextConfig.bundle = { ...recordValue(nextConfig.bundle), ...recordValue(sourceConfig.bundle) }
  return nextConfig
}

function recordValue(value: unknown): JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as JsonRecord : {}
}

function replaceInFile(path: string, replacements: Array<[RegExp, string]>) {
  if (!existsSync(path)) {
    warnings.push(`跳过不存在文件：${projectRelativePath(path)}`)
    return
  }

  const content = readFileSync(path, 'utf8')
  let nextContent = content

  for (const [pattern, replacement] of replacements)
    nextContent = nextContent.replace(pattern, replacement)

  writeIfChanged(path, nextContent)
}

function writeJsonIfChanged(path: string, value: unknown, options: { compact?: boolean } = {}) {
  if (writeJsonFileIfChanged(path, value, options))
    changes.push(`更新 ${projectRelativePath(path)}`)
}

function writeIfChanged(path: string, content: string) {
  if (writeTextIfChanged(path, content))
    changes.push(`更新 ${projectRelativePath(path)}`)
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

function projectRelativePath(path: string) {
  return toRelativePath({ rootDir: workspaceRoot, targetPath: path })
}

runCommandEntry(import.meta.url, runTauriSync)
