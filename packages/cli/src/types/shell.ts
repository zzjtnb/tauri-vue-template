/** 可被调用方旁路记录的子进程输出流。 */
export type RunOutputStream = 'stdout' | 'stderr'

/** 子进程输出监听器；release 日志用它把构建输出同步写入文件。 */
export type RunOutput = (chunk: string, stream: RunOutputStream) => void

/** CLI 执行子进程时可配置的选项。 */
export interface RunOptions {
  /** 子进程工作目录；未传时继承当前 Node 进程工作目录。 */
  cwd?: string
  /** 是否直接继承当前终端输入输出；适合需要展示完整交互日志的命令。 */
  inherit?: boolean
  /** 同步命令 stdout/stderr 的最大缓冲区字节数；用于可能输出大量诊断信息的命令。 */
  maxBuffer?: number
  /** 旁路记录 stdout/stderr；不改变命令真实执行参数，只额外复制输出。 */
  output?: RunOutput
  /** 是否隐藏命令日志；同步命令仍保留 stdout/stderr 管道供调用方读取。 */
  silent?: boolean
  /** 异步命令的 stdio 策略；未传时默认继承终端。 */
  stdio?: 'inherit' | 'pipe' | 'ignore'
}

/** 异步子进程的最小结果；调用方根据 status 决定是否中断。 */
export interface RunLiveResult {
  /** 子进程退出码；无法取得退出码时按 1 处理。 */
  status: number
}
