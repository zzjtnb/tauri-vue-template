import type { HttpDebugErrorPayload, HttpDebugLogger, HttpDebugResponsePayload, HttpResolvedRequestConfig } from './types.ts'

/**
 * 将 Fetch Headers 转换成普通对象。
 *
 * `Headers` 是可迭代对象，直接打印时不同浏览器控制台展示效果不一致；
 * 转成 `Record<string, string>` 后，调试日志可以稳定展开和复制。
 *
 * 注意：本函数不做脱敏。开启 debug 表示调用方需要完整排查请求细节，
 * 是否过滤敏感字段应由业务层决定，而不是通用 HTTP 库擅自改写日志。
 *
 * @param headers - Fetch Headers 实例。
 * @returns 普通对象形式的 headers。
 * @internal
 */
function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * 默认空调试器。
 *
 * `request.ts` 无论 debug 是否开启都会调用调试器。关闭 debug 时使用该空实现，
 * 可以让请求执行流保持线性，避免在关键路径里散落多处 `if (debug)` 分支。
 *
 * @public
 */
export const silentHttpDebugger: HttpDebugLogger = {
  request: () => undefined,
  response: () => undefined,
  error: () => undefined,
}

/**
 * 创建控制台调试器。
 *
 * 输出内容包含最终请求配置、完整 headers、原始 body、fetch requestInit、
 * 响应状态、解析后的响应数据以及错误对象。该输出不做字段过滤。
 *
 * @param logger - 日志目标，默认使用全局 `console`；测试中可传入自定义 logger 断言输出。
 * @returns HTTP 调试器实现。
 * @example
 * ```ts
 * const client = new HttpClient({
 *   debug: true,
 *   logger: console,
 * })
 * ```
 * @public
 */
export function createHttpDebugger(logger: Pick<Console, 'info' | 'error'> = console): HttpDebugLogger {
  return {
    /**
     * 输出请求发出前的最终配置。
     *
     * 这里的 config 已经过默认配置合并、请求拦截器处理、URL 拼接和 body 序列化。
     */
    request(config: HttpResolvedRequestConfig) {
      logger.info('[http:request]', {
        method: config.method,
        url: config.requestUrl,
        params: config.params,
        headers: headersToObject(config.headers),
        body: config.body,
        requestInit: config.requestInit,
      })
    },

    /** 输出 HTTP 响应状态和已解析响应体。 */
    response(payload: HttpDebugResponsePayload) {
      logger.info('[http:response]', {
        method: payload.config.method,
        url: payload.config.requestUrl,
        status: payload.status,
        headers: headersToObject(payload.config.headers),
        data: payload.data,
      })
    },

    /** 输出请求链任意阶段抛出的错误。 */
    error(payload: HttpDebugErrorPayload) {
      logger.error('[http:error]', {
        method: payload.config?.method,
        url: payload.config?.requestUrl,
        headers: payload.config ? headersToObject(payload.config.headers) : undefined,
        body: payload.config?.body,
        error: payload.error,
      })
    },
  }
}
