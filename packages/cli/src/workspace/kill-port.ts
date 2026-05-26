/**
 * 本地端口释放命令。
 *
 * 默认处理模板和示例应用常用的 `3000` / `3001` 端口。命令会先发送 `SIGTERM`，
 * 复查仍占用时才发送 `SIGKILL`，并以最终端口复查结果决定退出状态。
 */
import process from 'node:process'
import { setTimeout } from 'node:timers/promises'
import { log } from '@clack/prompts'
import { runCommandEntry, runSync } from '#/utils.ts'

const defaultPorts = ['3000', '3001']

export async function runKillPort(args: string[]) {
  const ports = args.length > 0 ? args : defaultPorts
  let releasedCount = 0
  let freeCount = 0
  let failedCount = 0
  let invalidCount = 0

  for (const port of ports) {
    log.info(`检查端口 ${port}`)

    if (!isValidPort(port)) {
      log.warn(`非法端口：${port}（有效范围 1-65535）`)
      invalidCount += 1
      continue
    }

    const pids = getPidsByPort(port)
    if (pids.length === 0) {
      log.success(`端口 ${port} 未被占用`)
      freeCount += 1
      continue
    }

    log.info(`发现端口 ${port} 被进程占用：${pids.join(', ')}`)
    terminatePids(pids, 'SIGTERM')
    await setTimeout(1000)

    const remainPids = getPidsByPort(port)
    if (remainPids.length > 0) {
      log.warn(`仍有进程占用，强制终止：${remainPids.join(', ')}`)
      terminatePids(remainPids, 'SIGKILL')
      await setTimeout(1000)
    }

    const finalPids = getPidsByPort(port)
    if (finalPids.length === 0) {
      log.success(`端口 ${port} 已释放`)
      releasedCount += 1
    }
    else {
      log.error(`端口 ${port} 仍被占用：${finalPids.join(', ')}`)
      failedCount += 1
    }
  }

  log.info(`处理结果：已释放 ${releasedCount}，本来空闲 ${freeCount}，释放失败 ${failedCount}，非法端口 ${invalidCount}`)
  if (failedCount > 0 || invalidCount > 0)
    process.exitCode = 1
}

function isValidPort(port: string) {
  const value = Number(port)
  return Number.isInteger(value) && value >= 1 && value <= 65535
}

/**
 * 通过 lsof 查询端口占用进程。
 * lsof 在端口空闲时会返回非零状态，这里按“无 PID”处理而不是抛错。
 */
function getPidsByPort(port: string) {
  const result = runSync('lsof', ['-ti', `:${port}`], { silent: true })
  if (result.status !== 0 || !result.stdout)
    return []
  return [...new Set(result.stdout.split(/\r?\n/).map(pid => pid.trim()).filter(Boolean))]
}

function terminatePids(pids: string[], signal: NodeJS.Signals) {
  for (const pid of pids) {
    try {
      process.kill(Number(pid), signal)
    }
    catch {
      // 进程可能已经退出；端口复查会决定最终状态。
    }
  }
}

runCommandEntry(import.meta.url, runKillPort)
