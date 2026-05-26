import type { HttpErrorMeta, HttpMethod, HttpRequestBody, HttpResolvedRequestConfig } from './types'

/**
 * HTTP 状态错误。
 *
 * `HttpError` 只表示网络层或 HTTP 层失败，例如 HTTP 400、401、500。
 * 它不会解释业务响应码，也不会假设响应体里存在 `code`、`message`、`data` 等字段。
 *
 * @template TBody 请求体类型。
 * @public
 */
export class HttpError<TBody = HttpRequestBody> extends Error {
  /** 请求方法。 */
  method: HttpMethod

  /** 最终请求 URL。 */
  url: string

  /** HTTP 状态码。 */
  status: number

  /** 已解析错误响应体。 */
  data?: unknown

  /** 原始 Fetch Response。 */
  response?: Response

  /** 当前请求最终执行配置。 */
  config?: HttpResolvedRequestConfig<TBody>

  /**
   * 创建 HTTP 错误。
   *
   * @param meta - 错误元信息。
   */
  constructor(meta: HttpErrorMeta<TBody>) {
    super(meta.message)
    this.name = 'HttpError'
    this.method = meta.method
    this.url = meta.url
    this.status = meta.status
    this.data = meta.data
    this.response = meta.response
    this.config = meta.config
  }
}
