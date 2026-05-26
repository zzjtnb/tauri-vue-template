/**
 * workspace 格式化选择器。
 *
 * 命令先发现 `apps/*` 和 `packages/*` 中声明了 lint 脚本的包，再让使用者选择项目和工具。
 * 非交互模式会从 stdin 读取选择，便于脚本化验证；交互模式使用 Clack 多选提示。
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { cancel, isCancel, log, multiselect } from '@clack/prompts'
import { run, runCommandEntry, workspaceRoot } from '#/utils.ts'

interface ProjectInfo {
  dir: string
  label: string
  name: string
  root: boolean
  scripts: Record<string, unknown>
}

const tools = [
  { key: 'eslint', task: 'lint:eslint', label: 'ESLint' },
  { key: 'stylelint', task: 'lint:stylelint', label: 'Stylelint' },
  { key: 'markdownlint', task: 'lint:markdownlint', label: 'Markdownlint' },
]
// 只扫描 workspace 的标准包目录，不把根目录当成普通包处理。
const workspaceRoots = ['apps', 'packages']
const workspaceRootProject: ProjectInfo = {
  name: 'workspace-root',
  label: 'workspace root',
  dir: '.',
  scripts: { markdownlint: true },
  root: true,
}

export async function runFormatSelector() {
  const projects = [workspaceRootProject, ...await discoverProjects()]
  const scriptedInput = process.stdin.isTTY ? null : await readScriptedInput()
  const selectedProjectKeys = await askMultiSelect({ scriptedInput, title: '选择项目', choices: projects.map(projectChoice), defaultSelected: [] })
  const projectMap = new Map(projects.map(project => [project.name, project]))
  const selectedProjects = selectedProjectKeys.map(name => projectMap.get(name)).filter(Boolean) as ProjectInfo[]
  const toolChoices = availableToolChoices(selectedProjects)

  if (toolChoices.length === 0) {
    log.warn('所选项目没有可执行的格式化任务。')
    process.exitCode = 1
    return
  }

  const selectedToolKeys = await askMultiSelect({ scriptedInput, title: '选择格式化工具', choices: toolChoices, defaultSelected: [] })
  const selectedTools = tools.filter(tool => selectedToolKeys.includes(tool.key))
  let hasRunnableTask = false

  for (const tool of selectedTools) {
    const packageProjects = selectedProjects.filter(project => !project.root && supportsTool(project, tool))
    const skippedProjects = selectedProjects.filter(project => !supportsTool(project, tool))
    const shouldRunRootMarkdownlint = tool.key === 'markdownlint' && selectedProjects.some(project => project.root)

    for (const project of skippedProjects)
      log.warn(`跳过 ${project.label}：不支持 ${tool.label}。`)

    if (shouldRunRootMarkdownlint) {
      hasRunnableTask = true
      await run('pnpm', ['exec', 'markdownlint-cli2', '--config', '.markdownlint-cli2.jsonc', '--fix', 'README.md'], { cwd: workspaceRoot })
    }

    if (packageProjects.length > 0) {
      hasRunnableTask = true
      await run('pnpm', ['turbo', 'run', tool.task, ...packageProjects.map(project => `--filter=${project.name}`)], { cwd: workspaceRoot })
    }
  }

  if (!hasRunnableTask) {
    log.warn('没有可执行的格式化任务。请重新选择工具和项目。')
    process.exitCode = 1
    return
  }

  log.success('格式化任务执行完成。')
}

/**
 * 发现可被格式化选择器展示的 workspace 包。
 * 缺失或无法解析的 package.json 会被跳过，避免单个实验目录阻断整个菜单。
 */
async function discoverProjects() {
  const projects: ProjectInfo[] = []

  for (const root of workspaceRoots) {
    const entries = await readdir(join(workspaceRoot, root), { withFileTypes: true }).catch(() => [])

    for (const entry of entries) {
      if (!entry.isDirectory())
        continue

      const dir = join(root, entry.name)
      const packageJson = await readPackageJson(join(workspaceRoot, dir, 'package.json'))
      if (!packageJson?.name)
        continue

      projects.push({ name: packageJson.name, label: packageJson.name, dir, scripts: packageJson.scripts ?? {}, root: false })
    }
  }

  return projects.toSorted((left, right) => left.name.localeCompare(right.name))
}

async function readPackageJson(path: string): Promise<{ name?: string, scripts?: Record<string, unknown> } | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  }
  catch {
    return null
  }
}

function projectChoice(project: ProjectInfo) {
  const support = supportedToolText(project)
  return { label: project.label, value: project.name, hint: `${project.dir} · ${support}` }
}

function supportedToolText(project: ProjectInfo) {
  const supported = tools.filter(tool => supportsTool(project, tool)).map(tool => tool.label)
  return supported.length > 0 ? `可用 ${supported.join(' / ')}` : '无可用格式化任务'
}

function supportsTool(project: ProjectInfo, tool: typeof tools[number]) {
  return project.root ? Boolean(project.scripts[tool.key]) : Boolean(project.scripts[tool.task])
}

function availableToolChoices(projects: ProjectInfo[]) {
  return tools.flatMap((tool) => {
    const supportedCount = projects.filter(project => supportsTool(project, tool)).length
    return supportedCount === 0
      ? []
      : [{ label: tool.label, value: tool.key, hint: `适用于 ${supportedCount}/${projects.length} 个已选项目` }]
  })
}

async function askMultiSelect({ scriptedInput, title, choices, defaultSelected }: {
  choices: Array<{ hint?: string, label: string, value: string }>
  defaultSelected: string[]
  scriptedInput: null | { index: number, lines: string[] }
  title: string
}) {
  if (!process.stdin.isTTY)
    return askScriptedMultiSelect({ scriptedInput, title, choices, defaultSelected })

  const result = await multiselect({ message: title, options: choices, required: true })
  if (isCancel(result)) {
    cancel('已取消。')
    process.exit(130)
  }

  return result
}

async function readScriptedInput() {
  const content = (await Array.fromAsync(process.stdin, chunk => String(chunk))).join('')
  return { index: 0, lines: content.split(/\r?\n/) }
}

function askScriptedMultiSelect({ scriptedInput, title, choices, defaultSelected }: {
  choices: Array<{ hint?: string, label: string, value: string }>
  defaultSelected: string[]
  scriptedInput: null | { index: number, lines: string[] }
  title: string
}) {
  if (!scriptedInput)
    throw new Error('非交互模式缺少输入。')

  console.log('')
  console.log(`${title}（非交互模式）`)
  console.log('  输入编号、key 或 all；直接回车使用默认选择。')
  choices.forEach((choice, index) => console.log(`  ${index + 1}. ${choice.label}${choice.hint ? ` · ${choice.hint}` : ''}`))
  process.stdout.write('选择: ')
  const answer = scriptedInput.lines[scriptedInput.index++] ?? ''
  process.stdout.write(`${answer}\n`)
  return parseSelection(answer, choices, defaultSelected)
}

/**
 * 解析非交互输入。支持编号、选项 key、逗号/空格分隔和 `all`，方便 CI 或管道输入复用。
 */
function parseSelection(answer: string, choices: Array<{ value: string }>, defaultSelected: string[]) {
  const value = answer.trim()
  if (!value) {
    if (defaultSelected.length === 0)
      throw new Error('没有选择任何有效项。')
    return defaultSelected
  }

  if (value.toLowerCase() === 'all')
    return choices.map(choice => choice.value)

  const selected = new Set<string>()
  const tokens = value.split(/[\s,，]+/).filter(Boolean)

  for (const token of tokens) {
    const index = Number(token)
    if (Number.isInteger(index) && index >= 1 && index <= choices.length) {
      selected.add(choices[index - 1].value)
      continue
    }

    const matchedChoice = choices.find(choice => choice.value === token)
    if (matchedChoice) {
      selected.add(matchedChoice.value)
      continue
    }

    log.warn(`忽略无法识别的选择：${token}`)
  }

  if (selected.size === 0)
    throw new Error('没有选择任何有效项。')

  return [...selected]
}

runCommandEntry(import.meta.url, runFormatSelector)
