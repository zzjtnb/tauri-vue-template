function padTimeSegment(timeSegment: number): string {
  return String(timeSegment).padStart(2, '0')
}

/**
 * 生成适合日志文件名和批次目录名的本地时间戳片段。
 *
 * 输出保留分隔符，便于人工阅读；例如 `2026-05-27_17-49-55`。
 *
 * @param date - 用于生成时间戳的日期；默认使用当前时间。
 * @returns 本地时间戳片段。
 * @public
 */
export function timestampSegment(date = new Date()): string {
  const year = date.getFullYear()
  const month = padTimeSegment(date.getMonth() + 1)
  const day = padTimeSegment(date.getDate())
  const hour = padTimeSegment(date.getHours())
  const minute = padTimeSegment(date.getMinutes())
  const second = padTimeSegment(date.getSeconds())
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`
}

/**
 * 把毫秒耗时格式化为简短展示文本。
 *
 * @param timeMs - 耗时，单位毫秒。
 * @returns 小于一分钟返回 `Ns`，否则返回 `Nm Ns`。
 * @public
 */
export function formatDuration(timeMs: number): string {
  const totalSeconds = Math.max(0, Math.round(timeMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0)
    return `${seconds}s`

  return `${minutes}m ${seconds}s`
}
