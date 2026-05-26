/**
 * Tauri 发布命令入口。
 *
 * release 是一个完整命令边界，而不是供其它模块复用的内部库。这里把发布流程保留在
 * 一个文件中：参数、平台矩阵、前端预构建、sandbox、产物归档、manifest、清理、导入
 * 和 updater 签名都围绕同一个 release 状态流转，避免为私有流程制造多层目录和样板导出。
 */
import type { WriteStream } from 'node:fs'
import type { AndroidAbi, AppTarget, TauriPlatform } from '#/types/tauri.ts'
import { cpSync, createWriteStream, existsSync, readdirSync, statSync, symlinkSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { cancel, isCancel, log, select, text } from '@clack/prompts'
import { formatDuration, timestampSegment, toRequiredPositiveInt, toSafeFileSegment } from '@tauri-vue-template/utils/core'
import { assertInsidePath, ensureDir, findFilesByExtension, hasPathExtension, inspectDebug, movePath, readJson, removePath, resolveInputPath, toRelativePath, uniqueFilePath, writeJson } from '@tauri-vue-template/utils/node'
import { runTauriSync } from '#/tauri/sync.ts'
import { availableTauriPlatforms, defaultTarget, loadAppTargets, promptSingleTargetName, promptTargetSelector, promptTauriPlatform, readTauriBuildTarget, resolveAppTargets, resolveSingleAppTarget, resolveTauriPlatform, tauriCommandParts, tauriPlatforms } from '#/tauri/target.ts'
import { formatCommand, runCommandEntry, runLive, runSync, tauriRoot, workspaceRoot } from '#/utils.ts'

interface MenuItem {
  hint?: string
  label: string
  value: () => void | Promise<void>
}

interface CommandOptions {
  /** Android 默认只打 aarch64；显式 universal 才构建全部 ABI。 */
  abi: AndroidAbi
  /** 原生构建最大并发数；release 会在隔离 sandbox 中并行执行。 */
  jobs: number
}

interface Manifest {
  /** 本地 release 工作区首次写入 manifest 的时间。 */
  generatedAt: string
  /** CLI 明确按 Tauri app target 构建出的产物索引。 */
  apps: Record<string, Record<string, Record<string, Partial<Record<'bundle' | 'updater', string[]>>>>>
  /** 只移动已有产物时的批次索引；这些产物不伪造 app/version。 */
  imported: Record<string, Record<string, { bundle: string[] }>>
}

interface BuildRecord {
  appName: string
  bundleArtifacts: string[]
  command: string
  endedAt: string
  error?: string
  platformName: string
  startedAt: string
  status: 'failed' | 'success'
  timeMs: number
  updaterArtifacts: string[]
  version: string
}

interface Session {
  logPath: string
  records: BuildRecord[]
  startedAtMs: number
  stream: WriteStream
}

interface Job {
  app: AppTarget
  platform: TauriPlatform
}

interface BuildPlan extends Job {
  target: ReturnType<typeof readTauriBuildTarget>
}

interface Sandbox extends BuildPlan {
  config: string
  root: string
}

const releaseDir = resolve(workspaceRoot, 'release')
const manifestPath = join(releaseDir, 'manifest.json')
const logDir = join(releaseDir, 'logs')
const sandboxRoot = resolve(workspaceRoot, '.tmp/release-builds')
const skippedCopyPaths = new Set(['target', '.turbo', 'node_modules', '.gradle', 'build', 'jniLibs'])
const signableUpdaterExtensions = ['.tar.gz', '.zip']
const updaterExtensions = [...signableUpdaterExtensions, '.sig']
const artifactExtensions = [...updaterExtensions, ...tauriPlatforms.flatMap(target => target.extensions)].sort((left, right) => right.length - left.length)
const artifactActions = [
  { name: 'move-existing', label: '导入已有产物', value: moveExistingArtifacts, hint: '不打包，移动到 release/imported/<batch>/。', comment: '只移动已有产物到 release/imported/<batch>/，不伪造应用目标和版本。' },
  { name: 'sign-updater', label: '签名 updater 更新包', value: signUpdaterArtifacts, hint: '密码只从 TAURI_SIGNING_PRIVATE_KEY_PASSWORD 读取。', comment: '扫描 release/apps/**/updater/ 下的 updater 包并签名；签名密码只从环境变量读取。' },
  { name: 'clean', label: '清理当前版本产物', value: cleanCurrentVersionArtifacts, hint: '删除当前 version，保留历史版本和 imported。', comment: '清理所有应用当前版本产物，保留历史版本和 imported。' },
] satisfies Array<MenuItem & { comment: string, name: string }>

export async function runTauriRelease(rawArgs: string[] = []) {
  const { args, options } = parseOptions(rawArgs.filter(arg => arg !== '--'))
  return args.length > 0
    ? runCommand(args, options)
    : promptMenu(`Tauri 发布工具（Android ABI: ${options.abi}，并发: ${options.jobs}）`, buildMenuItems(options))
}

async function runCommand(args: string[], options: CommandOptions) {
  const [command, first, second] = args
  const actions: Record<string, MenuItem['value']> = {
    'platform': () => {
      const platform = resolveTauriPlatform(first)
      return buildJobs(`platform-${platform.name}`, jobsFor(loadAppTargets(), [platform]), options)
    },
    'app': () => {
      const app = resolveSingleAppTarget(first, '按应用和平台打包只能指定单个应用目标。')
      const platform = resolveTauriPlatform(second)
      return buildJobs(`app-${app.name}-${platform.name}`, [{ app, platform }], options)
    },
    'all': () => buildJobs('all', jobsFor(loadAppTargets(), availableTauriPlatforms()), options),
    ...Object.fromEntries(artifactActions.map(action => [action.name, action.value])),
    'matrix': printCommandMatrix,
    'list': printCommandMatrix,
    'help': printReleaseHelp,
    '-h': printReleaseHelp,
    '--help': printReleaseHelp,
  }
  const action = actions[command]
  if (!action)
    throw new Error(`未知 Tauri 发布命令：${args.join(' ')}。可用命令：platform <platform>、app <target> <platform>、all、move-existing、sign-updater、clean、matrix、help`)
  await action()
}

/**
 * 解析 release 命令行选项。
 *
 * Android 默认只打 aarch64；原生构建并发数默认按宿主 CPU 保守取值，避免全平台构建时压满机器。
 */
function parseOptions(args: string[]) {
  const options: CommandOptions = { abi: 'aarch64', jobs: Math.max(1, Math.min(4, availableParallelism() - 1)) }
  const rest: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    const [name, inlineValue] = arg.split('=', 2)
    if (name !== '--abi' && name !== '--jobs') {
      rest.push(arg)
      continue
    }

    const value = inlineValue ?? args[index + 1]
    if (!value)
      throw new Error(`${name} 缺少参数值。`)
    if (!inlineValue)
      index += 1
    if (name === '--abi') {
      if (value !== 'aarch64' && value !== 'universal')
        throw new Error(`Android ABI 只支持 aarch64 或 universal：${value}`)
      options.abi = value
    }
    else {
      options.jobs = toRequiredPositiveInt({ label: '--jobs ', value })
    }
  }

  return { options, args: rest }
}

function buildMenuItems(options: CommandOptions): MenuItem[] {
  return [
    {
      label: '打包',
      value: () => promptMenu('选择打包方式', [
        {
          label: '按平台批量打包',
          hint: '先选平台，再多选应用目标。',
          value: async () => {
            const platform = await promptTauriPlatform('选择发布平台')
            const targetSelector = platform ? await promptTargetSelector(`选择要打包到 ${platform.label} 的应用目标`) : null
            if (platform && targetSelector)
              await buildJobs(`platform-${platform.name}`, jobsFor(resolveAppTargets(targetSelector), [platform]), options)
          },
        },
        {
          label: '按应用和平台打包',
          hint: '单个应用目标 + 单个平台。',
          value: async () => {
            const targetName = await promptSingleTargetName('选择要打包的应用目标')
            const platform = targetName ? await promptTauriPlatform('选择发布平台') : null
            if (targetName && platform) {
              const app = resolveSingleAppTarget(targetName)
              await buildJobs(`app-${app.name}-${platform.name}`, [{ app, platform }], options)
            }
          },
        },
        { label: '打包全部可用平台和全部应用目标', value: () => buildJobs('all', jobsFor(loadAppTargets(), availableTauriPlatforms()), options), hint: '只覆盖当前版本产物，不清空历史版本。' },
      ]),
      hint: '选择平台、应用或全量打包。',
    },
    ...artifactActions.map(({ label, value, hint }) => ({ label, value, hint })),
    { label: '查看非交互命令矩阵', value: printCommandMatrix, hint: '只打印命令和注释，不执行打包。' },
  ]
}

async function promptMenu(message: string, options: MenuItem[]) {
  const action = await select<MenuItem['value']>({ message, options })
  if (isCancel(action)) {
    cancel('已取消。')
    return
  }

  await action()
}

function printCommandMatrix() {
  const platforms = availableTauriPlatforms()
  const appTargets = loadAppTargets()

  console.log([
    '# Tauri 发布 tauri:release 非交互命令矩阵',
    '#',
    '# 说明：本输出只打印命令，不执行打包；复制 platform/app/all 命令才会真实构建。',
    `# 帮助：${releaseCommandLine(['help'])}`,
    `# 宿主平台：${process.platform}`,
    `# 可用平台：${platforms.map(platform => platform.name).join(', ')}`,
    `# 应用目标：${appTargets.map(target => target.name).join(', ')}`,
    '',
  ].join('\n'))
  for (const [title, commands] of [
    ['1. 按平台批量打包', platforms.map(platform => ({ comment: `构建全部应用目标的 ${platform.label} 产物；只覆盖各应用当前版本的 ${platform.name} 目录。`, args: ['platform', platform.name] }))],
    ['2. 全平台全部应用目标', [{ comment: '构建当前宿主可用的全部平台和全部应用目标；用于验证完整 release/apps/<app>/v<version>/<platform>/... 结构。', args: ['all'] }]],
    ['3. 按应用和平台打包', appTargets.flatMap(appTarget => platforms.map(platform => ({ comment: `构建“${appTarget.label}”（${appTarget.name}）应用目标的 ${platform.label} 产物；只覆盖该应用当前版本的 ${platform.name} 目录。`, args: ['app', appTarget.name, platform.name] })))],
    ['4. 产物和签名辅助命令', artifactActions.map(action => ({ comment: action.comment, args: [action.name] }))],
  ] as Array<[string, Array<{ args: string[], comment: string }>]>) {
    console.log(`## ${title}`)
    for (const command of commands)
      console.log(`# ${command.comment}\n${releaseCommandLine(command.args)}\n`)
  }
}

function printReleaseHelp() {
  const command = releaseCommandLine([])
  console.log([
    'Tauri 发布命令',
    '',
    '用法：',
    `  ${command}`,
    `  ${command} -- list`,
    `  ${command} -- platform <platform> [--abi aarch64|universal] [--jobs <n>]`,
    `  ${command} -- app <target> <platform> [--abi aarch64|universal] [--jobs <n>]`,
    `  ${command} -- all [--abi aarch64|universal] [--jobs <n>]`,
    ...artifactActions.map(action => `  ${command} -- ${action.name}`),
    '',
    `可用平台：${availableTauriPlatforms().map(platform => platform.name).join(', ')}`,
    `应用目标：${loadAppTargets().map(target => target.name).join(', ')}`,
    '',
    '说明：list/matrix/help 只输出信息；platform/app/all 才会真实打包。Android 默认只构建 aarch64。',
  ].join('\n'))
}

function releaseCommandLine(args: string[]) {
  return formatCommand(['pnpm', '--filter', '@tauri-vue-template/cli', 'tauri:release', ...(args.length > 0 ? ['--', ...args] : [])])
}

/** 把版本号转换成 release 目录段。 */
function versionSegment(version: string) {
  if (!/^[0-9A-Z][\w.+-]*$/i.test(version))
    throw new Error(`应用版本号不能作为 release 目录名：${version}`)
  return `v${version}`
}

function jobsFor(appTargets: AppTarget[], platforms: TauriPlatform[]) {
  return platforms.flatMap(platform => appTargets.map(app => ({ app, platform })))
}

function resolveBuildPlans(jobs: Job[]): BuildPlan[] {
  const targets = new Map<string, ReturnType<typeof readTauriBuildTarget>>()
  return jobs.map((job) => {
    let target = targets.get(job.app.name)
    if (!target) {
      target = readTauriBuildTarget(job.app)
      targets.set(job.app.name, target)
    }
    return { ...job, target }
  })
}

async function buildJobs(scope: string, jobs: Job[], options: CommandOptions) {
  const session = createSession(scope, options)
  let failed = false
  try {
    const plans = resolveBuildPlans(jobs)
    await Promise.all([...new Map(plans.map(plan => [plan.app.name, plan])).values()].map(plan => buildFrontend(plan, session)))
    const errors = await runSandboxQueue(prepareSandboxes(plans), options, session)
    writeSuccessfulRecords(session)
    if (errors.length > 0)
      throw errors[0]
  }
  catch (error) {
    failed = true
    throw error
  }
  finally {
    printSummary(session)
    writeLog(session, `endedAt: ${new Date().toISOString()}`)
    await new Promise<void>((resolvePromise, reject) => {
      session.stream.on('error', reject)
      session.stream.end(resolvePromise)
    })
    const logPath = `打包日志：${projectRelativePath(session.logPath)}`
    if (failed)
      log.warn(logPath)
    else
      log.success(logPath)
    log.success(`release 目录：${projectRelativePath(releaseDir)}`)
  }
}

async function buildFrontend(plan: BuildPlan, session: Session) {
  log.info(`预构建前端：${plan.app.label} (${plan.app.name})`)
  writeLog(session, `## frontend/${plan.app.name}`)
  const result = await runLive('pnpm', ['--dir', dirname(plan.target.frontendDist), 'build'], { cwd: workspaceRoot, output: prefixedOutput(session, `frontend/${plan.app.name}`) })
  if (result.status !== 0)
    throw new Error(`${plan.app.label} 前端构建失败，退出码 ${result.status}`)
}

function prepareSandboxes(jobs: BuildPlan[]) {
  if (existsSync(sandboxRoot)) {
    for (const entry of readdirSync(sandboxRoot))
      removePath(join(sandboxRoot, entry))
  }
  ensureDir(sandboxRoot)

  const mobileJobsByApp = new Map<string, BuildPlan[]>()
  const sandboxes: Sandbox[] = []
  let syncedGeneratedProject = false
  try {
    for (const job of jobs) {
      if (job.platform.sync)
        mobileJobsByApp.set(job.app.name, [...(mobileJobsByApp.get(job.app.name) ?? []), job])
      else
        sandboxes.push(createSandbox(job))
    }

    for (const appJobs of mobileJobsByApp.values()) {
      runTauriSync(['--target', appJobs[0].app.name])
      syncedGeneratedProject = true
      sandboxes.push(...appJobs.map(createSandbox))
    }
  }
  finally {
    if (syncedGeneratedProject)
      runTauriSync(['--target', defaultTarget])
  }

  return sandboxes
}

function createSandbox(job: BuildPlan): Sandbox {
  const root = join(sandboxRoot, `${job.app.name}-${job.platform.name}`)
  removePath(root)
  ensureDir(root)

  copyPackageBoundary(root)
  const nodeModules = resolve(tauriRoot, 'node_modules')
  if (existsSync(nodeModules))
    symlinkSync(nodeModules, join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
  const config = writeReleaseConfig(root, job)

  return { ...job, config, root }
}

function copyPackageBoundary(root: string) {
  for (const entry of ['package.json', 'scripts', 'src-tauri']) {
    const source = resolve(tauriRoot, entry)
    if (existsSync(source))
      cpSync(source, join(root, entry), { filter: path => !skippedCopyPaths.has(basename(path)), recursive: true })
  }
}

function writeReleaseConfig(root: string, job: BuildPlan) {
  const config = structuredClone(job.target.config)
  config.build ??= {}
  config.build.frontendDist = job.target.frontendDist
  // Tauri 会把 --config 与默认 tauri.conf.json 合并；必须用 null 覆盖构建钩子，不能只删除字段。
  config.build.beforeBuildCommand = null

  const relativeConfig = join('src-tauri', `tauri.${job.app.name}.release.conf.json`)
  // 同步替换 sandbox 默认配置，避免默认 tauri.conf.json 中的构建钩子再次参与合并。
  writeJson(join(root, 'src-tauri', 'tauri.conf.json'), config)
  writeJson(join(root, relativeConfig), config)
  return relativeConfig
}

async function runSandboxQueue(sandboxes: Sandbox[], options: CommandOptions, session: Session) {
  const errors: Error[] = []
  let nextIndex = 0

  async function worker() {
    while (nextIndex < sandboxes.length) {
      const sandbox = sandboxes[nextIndex]
      nextIndex += 1
      try {
        await buildSandbox(sandbox, options, session)
      }
      catch (error: unknown) {
        errors.push(error instanceof Error ? error : new Error(inspectDebug(error)))
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(options.jobs, sandboxes.length) }, () => worker()))
  return errors
}

async function buildSandbox(sandbox: Sandbox, options: CommandOptions, session: Session) {
  const { version } = sandbox.target
  const startedAtMs = Date.now()
  const record: BuildRecord = {
    appName: sandbox.app.name,
    bundleArtifacts: [],
    command: '',
    endedAt: '',
    platformName: sandbox.platform.name,
    startedAt: new Date(startedAtMs).toISOString(),
    status: 'failed',
    timeMs: 0,
    updaterArtifacts: [],
    version,
  }
  session.records.push(record)

  log.info(`打包 ${sandbox.platform.label}：${sandbox.app.label} (${sandbox.app.name}) v${version}`)
  writeLog(session, `## ${sandbox.app.name}/${sandbox.platform.name} v${version}`)
  writeInspect(session, 'build', {
    app: sandbox.app,
    options,
    platform: sandbox.platform,
    sandbox: sandbox.root,
    startedAt: record.startedAt,
    version,
  })

  try {
    const trackedExtensions = [...sandbox.platform.extensions, ...updaterExtensions]
    const beforeArtifacts = snapshotArtifacts(sandbox.root, sandbox.platform, trackedExtensions)
    const command = tauriCommandParts(sandbox.platform.name, sandbox.config, { androidAbi: options.abi })
    const result = await runLive(command.runner, command.args, { cwd: sandbox.root, output: prefixedOutput(session, `${sandbox.app.name}/${sandbox.platform.name}`) })
    record.command = formatCommand([command.runner, ...command.args])
    writeInspect(session, 'targetResult', { ...command, status: result.status })

    if (result.status !== 0)
      throw new Error(`${sandbox.app.label} / ${sandbox.platform.label} 构建失败，退出码 ${result.status}`)

    const changed = changedArtifacts(sandbox.root, sandbox.platform, beforeArtifacts, trackedExtensions)
    const bundleArtifacts = changed.filter(artifact => hasPathExtension(artifact, sandbox.platform.extensions))
    const updaterArtifacts = changed.filter(artifact => hasPathExtension(artifact, updaterExtensions))
    if (bundleArtifacts.length === 0)
      throw new Error(`${sandbox.app.label} / ${sandbox.platform.label} 未发现新增产物，请检查构建输出。`)

    removePath(join(releaseDir, 'apps', sandbox.app.name, versionSegment(version), sandbox.platform.name))
    const bundleDestinations = moveArtifactsToDir(sandbox.app.label, sandbox.platform, bundleArtifacts, releaseAppArtifactDir(sandbox.app, version, sandbox.platform, 'bundle'))
    const updaterDestinations = updaterArtifacts.length > 0
      ? moveArtifactsToDir(sandbox.app.label, sandbox.platform, updaterArtifacts, releaseAppArtifactDir(sandbox.app, version, sandbox.platform, 'updater'))
      : []
    record.bundleArtifacts = bundleDestinations.map(releaseRelativePath)
    record.updaterArtifacts = updaterDestinations.map(releaseRelativePath)
    record.status = 'success'
  }
  catch (error: unknown) {
    record.error = error instanceof Error ? error.message : inspectDebug(error)
    writeInspect(session, 'error', error)
    throw error
  }
  finally {
    const endedAtMs = Date.now()
    record.endedAt = new Date(endedAtMs).toISOString()
    record.timeMs = endedAtMs - startedAtMs
    writeLog(session, `endedAt: ${record.endedAt}`)
    writeLog(session, `status: ${record.status}`)
    writeLog(session, `duration: ${formatDuration(record.timeMs)}`)
    if (record.error)
      writeLog(session, `error: ${record.error}`)
    writeLog(session, '')
  }
}

function writeSuccessfulRecords(session: Session) {
  const manifest = readManifest()
  for (const record of session.records) {
    if (record.status !== 'success')
      continue

    removeAppPlatform(manifest, record.appName, record.version, record.platformName)
    const appEntry = manifest.apps[record.appName] ??= {}
    const versionEntry = appEntry[versionSegment(record.version)] ??= {}
    const platformEntry = versionEntry[record.platformName] ??= {}
    platformEntry.bundle = [...record.bundleArtifacts]
    if (record.updaterArtifacts.length > 0)
      platformEntry.updater = [...record.updaterArtifacts]
  }
  writeJson(manifestPath, manifest)
}

function createSession(scope: string, options: CommandOptions) {
  ensureDir(releaseDir)
  ensureDir(logDir)
  const logPath = `${logDir}/${timestampSegment()}-${toSafeFileSegment(scope)}.log`
  const session: Session = {
    logPath,
    records: [],
    startedAtMs: Date.now(),
    stream: createWriteStream(logPath, { flags: 'a' }),
  }

  writeLog(session, '# Tauri release build log')
  writeInspect(session, 'session', {
    host: process.platform,
    logPath: releaseRelativePath(logPath),
    options,
    releaseDir: projectRelativePath(releaseDir),
    scope,
    startedAt: new Date(session.startedAtMs).toISOString(),
  })
  return session
}

function printSummary(session: Session) {
  const totalMs = Date.now() - session.startedAtMs
  const successCount = session.records.filter(record => record.status === 'success').length
  const failedCount = session.records.length - successCount
  const summary = `打包统计：总耗时 ${formatDuration(totalMs)}，成功 ${successCount}，失败 ${failedCount}`
  log.info(summary)
  writeLog(session, '')
  writeLog(session, summary)

  for (const record of session.records) {
    const artifacts = [...record.bundleArtifacts, ...record.updaterArtifacts]
    const line = `${record.status === 'success' ? '成功' : '失败'} ${record.appName}/${record.platformName} v${record.version}，耗时 ${formatDuration(record.timeMs)}，产物 ${artifacts.length} 个`
    console.log(`- ${line}`)
    writeLog(session, `- ${line}`)
    writeLog(session, `  command: ${record.command}`)
    if (record.error)
      writeLog(session, `  error: ${record.error}`)
    for (const artifact of artifacts)
      writeLog(session, `  artifact: ${artifact}`)
  }
  writeInspect(session, 'records', session.records)
}

function writeLog(session: Session, line: string) {
  session.stream.write(`${line}\n`)
}

function writeInspect(session: Session, label: string, value: unknown) {
  session.stream.write(`${label}: ${inspectDebug(value)}\n\n`)
}

function prefixedOutput(session: Session, label: string) {
  return (chunk: string) => session.stream.write(chunk.split('\n').map(line => line ? `[${label}] ${line}` : line).join('\n'))
}

function platformArtifacts(root: string, platform: TauriPlatform, extensions = platform.extensions) {
  return platform.outputs.flatMap(output => findFilesByExtension(resolve(root, output), extensions))
}

function snapshotArtifacts(root: string, platform: TauriPlatform, extensions = platform.extensions) {
  return new Map(platformArtifacts(root, platform, extensions).map(artifact => [artifact, artifactSignature(artifact)]))
}

function changedArtifacts(root: string, platform: TauriPlatform, before: Map<string, string>, extensions = platform.extensions) {
  return platformArtifacts(root, platform, extensions).filter(artifact => before.get(artifact) !== artifactSignature(artifact))
}

function artifactSignature(path: string) {
  const currentStat = statSync(path)
  return `${currentStat.size}:${currentStat.mtimeMs}`
}

function releaseAppArtifactDir(appTarget: AppTarget, version: string, platform: TauriPlatform, kind: 'bundle' | 'updater') {
  return join(releaseDir, 'apps', appTarget.name, versionSegment(version), platform.name, kind)
}

function moveArtifactsToDir(label: string, platform: TauriPlatform, artifacts: string[], targetDir: string) {
  if (artifacts.length === 0)
    throw new Error(`${label} / ${platform.label} 未发现新增产物，请检查构建输出。`)

  const destinations: string[] = []
  for (const artifact of artifacts) {
    const destination = uniqueFilePath(targetDir, artifact, artifactExtensions)
    movePath(artifact, destination)
    destinations.push(destination)
    log.success(`${label} / ${platform.label}: ${projectRelativePath(destination)}`)
    checkMacSignature(destination)
  }
  return destinations
}

function checkMacSignature(artifactPath: string) {
  const isApp = artifactPath.endsWith('.app')
  const isDmg = artifactPath.endsWith('.dmg')
  if (process.platform !== 'darwin' || (!isApp && !isDmg))
    return

  const args = isApp ? ['--verify', '--deep', '--strict', artifactPath] : ['--verify', '--strict', artifactPath]
  const result = runSync('codesign', args, { cwd: workspaceRoot, silent: true })
  if (result.status === 0)
    log.success(`签名检查通过：${projectRelativePath(artifactPath)}`)
  else
    log.warn(`未签名或签名校验失败：${projectRelativePath(artifactPath)}`)
}

function readManifest(): Manifest {
  const manifest = existsSync(manifestPath) ? readJson<Partial<Manifest>>(manifestPath) : {}
  return {
    generatedAt: typeof manifest.generatedAt === 'string' ? manifest.generatedAt : new Date().toISOString(),
    apps: manifest.apps ?? {},
    imported: manifest.imported ?? {},
  }
}

function removeAppPlatform(manifest: Manifest, appName: string, version: string, platformName: string) {
  const versionKey = versionSegment(version)
  const app = manifest.apps[appName]
  if (!app?.[versionKey])
    return

  delete app[versionKey][platformName]
  deleteEmptyRecordKeys(app, versionKey)
  deleteEmptyRecordKeys(manifest.apps, appName)
}

function deleteEmptyRecordKeys(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
      delete record[key]
  }
}

function moveExistingArtifacts() {
  ensureDir(releaseDir)
  const batch = timestampSegment()
  const manifest = readManifest()
  let count = 0

  for (const platform of availableTauriPlatforms()) {
    const artifacts = platformArtifacts(tauriRoot, platform)
    if (artifacts.length === 0)
      continue

    count += artifacts.length
    const destinations = moveArtifactsToDir('已有产物', platform, artifacts, join(releaseDir, 'imported', batch, platform.name, 'bundle'))
    const platformEntry = (manifest.imported[batch] ??= {})[platform.name] ??= { bundle: [] }
    platformEntry.bundle.push(...destinations.map(releaseRelativePath))
  }

  if (count === 0)
    throw new Error('未发现任何可移动产物，请先选择打包目标。')
  writeJson(manifestPath, manifest)
  log.success(`release 目录：${projectRelativePath(releaseDir)}`)
}

function cleanCurrentVersionArtifacts() {
  const manifest = existsSync(manifestPath) ? readManifest() : null
  for (const appTarget of loadAppTargets()) {
    const { version } = readTauriBuildTarget(appTarget)
    const versionKey = versionSegment(version)
    removePath(join(releaseDir, 'apps', appTarget.name, versionKey))

    const app = manifest?.apps[appTarget.name]
    if (app) {
      delete app[versionKey]
      deleteEmptyRecordKeys(manifest.apps, appTarget.name)
    }
    log.success(`已清理当前版本产物：${appTarget.label} v${version}`)
  }
  if (manifest)
    writeJson(manifestPath, manifest)
  log.success(`release 目录：${projectRelativePath(releaseDir)}`)
}

async function signUpdaterArtifacts() {
  const artifacts = findFilesByExtension(join(releaseDir, 'apps'), signableUpdaterExtensions).filter(isUpdaterArtifactPath)
  const defaultArtifact = artifacts.length === 1 ? projectRelativePath(artifacts[0]) : artifacts.length > 1 ? 'all' : ''

  if (artifacts.length > 0)
    log.info(['候选 updater 更新包：', ...artifacts.map(artifact => `  ${projectRelativePath(artifact)}`)].join('\n'))

  const artifactInput = await text({ defaultValue: defaultArtifact, message: '输入 updater 更新包路径；输入 all 签名全部候选' })
  if (isCancel(artifactInput)) {
    cancel('已取消签名。')
    return
  }

  if (!artifactInput) {
    log.warn('未输入 updater 更新包路径，已取消签名')
    return
  }

  const selectedArtifacts = artifactInput.toLowerCase() === 'all' ? artifacts : [resolveInputPath({ rootDir: workspaceRoot, targetPath: artifactInput })]
  if (selectedArtifacts.length === 0) {
    log.warn('release/ 中没有可签名的 updater 更新包')
    return
  }

  for (const artifact of selectedArtifacts)
    assertSignableUpdaterArtifact(artifact)

  const hasSigningKeyEnv = process.env.TAURI_SIGNING_PRIVATE_KEY || process.env.TAURI_SIGNING_PRIVATE_KEY_PATH
  let privateKeyPath = ''
  if (!hasSigningKeyEnv) {
    const privateKeyInput = await text({ message: '可选：私钥文件路径，留空则使用环境变量或 CLI 默认行为' })
    if (isCancel(privateKeyInput)) {
      cancel('已取消签名。')
      return
    }
    privateKeyPath = privateKeyInput ? resolveInputPath({ rootDir: workspaceRoot, targetPath: privateKeyInput }) : ''
  }

  if (privateKeyPath && !existsSync(privateKeyPath))
    throw new Error(`私钥文件不存在：${privateKeyPath}`)

  log.info('密码请通过 TAURI_SIGNING_PRIVATE_KEY_PASSWORD 注入；脚本不会读取或打印密码。')
  for (const artifact of selectedArtifacts) {
    const args = ['--filter', '@tauri-vue-template/tauri', 'tauri:signer', '--', 'sign', projectRelativePath(artifact)]
    if (privateKeyPath)
      args.push('-f', privateKeyPath)
    const result = runSync('pnpm', args, { cwd: workspaceRoot, inherit: true })
    if (result.status !== 0)
      process.exit(result.status ?? 1)
  }
}

function isUpdaterArtifactPath(path: string) {
  const segments = releaseRelativePath(path).split('/')
  return segments.length >= 6 && segments[0] === 'apps' && segments[2]?.startsWith('v') && segments[4] === 'updater'
}

function assertSignableUpdaterArtifact(artifact: string) {
  assertInsidePath({ label: 'updater 更新包', rootDir: releaseDir, targetPath: artifact })
  if (!isUpdaterArtifactPath(artifact))
    throw new Error(`updater 更新包必须位于 release/apps/<app>/v<version>/<platform>/updater/ 内：${artifact}`)
  if (!existsSync(artifact) || statSync(artifact).isDirectory())
    throw new Error(`updater 更新包不存在或不是文件：${artifact}`)
  if (!hasPathExtension(artifact, signableUpdaterExtensions))
    throw new Error(`updater 更新包只支持 ${signableUpdaterExtensions.join(' / ')}：${artifact}`)
}

function projectRelativePath(path: string) {
  return toRelativePath({ rootDir: workspaceRoot, targetPath: path })
}

function releaseRelativePath(path: string) {
  return toRelativePath({ rootDir: releaseDir, targetPath: assertInsidePath({ label: 'release 产物路径', rootDir: releaseDir, targetPath: path }) })
}

runCommandEntry(import.meta.url, runTauriRelease)
