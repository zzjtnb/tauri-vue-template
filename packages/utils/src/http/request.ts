import type {
  HttpBodyRequestOptions,
  HttpClientOptions,
  HttpErrorInterceptorContext,
  HttpRequestBody,
  HttpRequestConfig,
  HttpRequestOptions,
  HttpResolvedRequestConfig,
  HttpResponseType,
  HttpResult,
} from './types.ts'
import { createHttpDebugger, silentHttpDebugger } from './debug.ts'
import { HttpError } from './error.ts'
import { createHttpInterceptors } from './interceptors.ts'
import { appendParams, createAbortSignal, isBodyInit, joinUrl, mergeHeaders, tryParseJson } from './utils.ts'

/**
 * 单个原始请求的执行状态。
 *
 * 该状态对象会在错误拦截器 retry 前后共享，确保同一个原始请求最多只会重试一次。
 *
 * @template TBody 请求体类型。
 * @internal
 */
interface HttpExecutionState<TBody> {
  /** 记录当前原始请求是否已重试。 */
  retried: boolean
  /** 保存最初传入的请求配置，retry 默认基于它重新发起请求。 */
  originalConfig: HttpRequestConfig<TBody>
}

/**
 * 原生 fetch HTTP 客户端。
 *
 * 这是一个标准通用 HTTP 工具类：
 * - 只处理 HTTP 请求、响应解析、拦截器和错误包装。
 * - 不内置业务响应码。
 * - 不依赖 UI、路由、状态管理或应用级 Store。
 * - 可以创建多个实例分别服务不同后端域名或不同默认配置。
 *
 * @public
 */
export class HttpClient {
  /**
   * 请求、响应、错误三类拦截器。
   *
   * 执行顺序：
   * 1. 请求拦截器：按注册顺序修改原始请求配置。
   * 2. fetch 请求与响应解析。
   * 3. 响应拦截器：按注册顺序修改成功结果。
   * 4. 错误拦截器：请求阶段、HTTP 非 2xx、响应拦截器异常都会进入这里。
   */
  readonly interceptors = createHttpInterceptors()

  /** 客户端级默认配置。 */
  private readonly defaults: HttpClientOptions

  /** debug 开启时使用控制台调试器，关闭时使用空调试器。 */
  private readonly debugLogger = silentHttpDebugger

  /**
   * 创建 HTTP 客户端。
   *
   * @param options - 客户端默认配置。
   */
  constructor(options: HttpClientOptions = {}) {
    this.defaults = options
    this.debugLogger = options.debug ? createHttpDebugger(options.logger) : silentHttpDebugger
  }

  /**
   * 执行请求并只返回解析后的响应体。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param config - 单次请求配置。
   * @returns 已按 responseType 解析后的响应体。
   * @throws HttpError HTTP 非 2xx 时抛出。
   * @throws unknown 请求拦截器、响应拦截器、fetch 或错误拦截器抛出的其他错误。
   */
  async request<TData = unknown, TBody = HttpRequestBody>(config: HttpRequestConfig<TBody>): Promise<TData> {
    const result = await this.requestResult<TData, TBody>(config)
    return result.data
  }

  /**
   * 执行请求并返回完整结果。
   *
   * 完整结果包含 `data`、原始 `Response` 和最终执行配置，适合需要读取响应头、状态码、
   * requestId、限流信息、下载元数据等场景。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param config - 单次请求配置。
   * @returns 完整请求结果。
   * @throws HttpError HTTP 非 2xx 时抛出。
   */
  async requestResult<TData = unknown, TBody = HttpRequestBody>(config: HttpRequestConfig<TBody>): Promise<HttpResult<TData, TBody>> {
    return this.execute<TData, TBody>(config, {
      retried: false,
      originalConfig: config,
    })
  }

  /**
   * 发送 GET 请求。
   *
   * @template TData 响应体类型。
   * @param url 请求路径或完整 URL。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  get<TData = unknown>(url: string, options: HttpRequestOptions = {}): Promise<TData> {
    return this.request<TData>({ ...options, url, method: 'GET' })
  }

  /**
   * 发送 DELETE 请求。
   *
   * @template TData 响应体类型。
   * @param url 请求路径或完整 URL。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  delete<TData = unknown>(url: string, options: HttpRequestOptions = {}): Promise<TData> {
    return this.request<TData>({ ...options, url, method: 'DELETE' })
  }

  /**
   * 发送 HEAD 请求。
   *
   * @template TData 响应体类型。
   * @param url 请求路径或完整 URL。
   * @param options 请求配置。
   * @returns 已解析响应体。HEAD 通常没有响应体，默认会得到 null。
   */
  head<TData = unknown>(url: string, options: HttpRequestOptions = {}): Promise<TData> {
    return this.request<TData>({ ...options, url, method: 'HEAD' })
  }

  /**
   * 发送 OPTIONS 请求。
   *
   * @template TData 响应体类型。
   * @param url 请求路径或完整 URL。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  options<TData = unknown>(url: string, options: HttpRequestOptions = {}): Promise<TData> {
    return this.request<TData>({ ...options, url, method: 'OPTIONS' })
  }

  /**
   * 发送 POST 请求。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param url 请求路径或完整 URL。
   * @param body 请求体。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  post<TData = unknown, TBody = HttpRequestBody>(url: string, body?: TBody, options: HttpBodyRequestOptions<TBody> = {}): Promise<TData> {
    return this.request<TData, TBody>({ ...options, url, method: 'POST', body })
  }

  /**
   * 发送 PUT 请求。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param url 请求路径或完整 URL。
   * @param body 请求体。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  put<TData = unknown, TBody = HttpRequestBody>(url: string, body?: TBody, options: HttpBodyRequestOptions<TBody> = {}): Promise<TData> {
    return this.request<TData, TBody>({ ...options, url, method: 'PUT', body })
  }

  /**
   * 发送 PATCH 请求。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param url 请求路径或完整 URL。
   * @param body 请求体。
   * @param options 请求配置。
   * @returns 已解析响应体。
   */
  patch<TData = unknown, TBody = HttpRequestBody>(url: string, body?: TBody, options: HttpBodyRequestOptions<TBody> = {}): Promise<TData> {
    return this.request<TData, TBody>({ ...options, url, method: 'PATCH', body })
  }

  /**
   * 内部请求执行流。
   *
   * 该方法串起完整生命周期：请求拦截器 -> 配置归一化 -> fetch -> 响应解析 ->
   * HTTP 状态判断 -> 响应拦截器 -> 错误拦截器。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param config 当前请求配置。
   * @param state 当前原始请求的 retry 状态。
   * @returns 完整请求结果。
   * @internal
   */
  private async execute<TData, TBody>(config: HttpRequestConfig<TBody>, state: HttpExecutionState<TBody>): Promise<HttpResult<TData, TBody>> {
    let resolvedConfig: HttpResolvedRequestConfig<TBody> | undefined
    let abort: { signal?: AbortSignal, cleanup: () => void } | undefined

    try {
      const interceptedConfig = await this.applyRequestInterceptors(config)
      resolvedConfig = this.resolveConfig(interceptedConfig)
      abort = createAbortSignal(resolvedConfig.signal, resolvedConfig.timeout)

      const executableConfig: HttpResolvedRequestConfig<TBody> = {
        ...resolvedConfig,
        requestInit: {
          ...resolvedConfig.requestInit,
          signal: abort.signal,
        },
      }

      this.debugLogger.request(executableConfig)

      const response = await fetch(executableConfig.requestUrl, executableConfig.requestInit)
      const data = await this.parseResponse(response, executableConfig.responseType ?? 'json')

      this.debugLogger.response({
        config: executableConfig,
        status: response.status,
        data,
      })

      if (!response.ok) {
        throw new HttpError<TBody>({
          message: `HTTP ${response.status}`,
          method: executableConfig.method,
          url: executableConfig.requestUrl,
          status: response.status,
          data,
          response,
          config: executableConfig,
        })
      }

      const result = await this.applyResponseInterceptors({
        data: data as TData,
        response,
        config: executableConfig,
      })

      return result as HttpResult<TData, TBody>
    }
    catch (error) {
      this.debugLogger.error({ config: resolvedConfig, error })
      return this.applyErrorInterceptors<TData, TBody>(error, state, resolvedConfig)
    }
    finally {
      abort?.cleanup()
    }
  }

  /**
   * 按注册顺序执行请求拦截器。
   *
   * @template TBody 请求体类型。
   * @param config 当前请求配置。
   * @returns 拦截器处理后的请求配置。
   * @internal
   */
  private async applyRequestInterceptors<TBody>(config: HttpRequestConfig<TBody>): Promise<HttpRequestConfig<TBody>> {
    let nextConfig = config
    for (const interceptor of this.interceptors.request.list()) {
      nextConfig = (await interceptor(nextConfig) as HttpRequestConfig<TBody> | void) ?? nextConfig
    }
    return nextConfig
  }

  /**
   * 按注册顺序执行响应拦截器。
   *
   * @param result 当前完整响应结果。
   * @returns 拦截器处理后的完整响应结果。
   * @internal
   */
  private async applyResponseInterceptors(result: HttpResult): Promise<HttpResult> {
    let nextResult = result
    for (const interceptor of this.interceptors.response.list()) {
      nextResult = await interceptor(nextResult) ?? nextResult
    }
    return nextResult
  }

  /**
   * 按注册顺序执行错误拦截器。
   *
   * 拦截器可以返回 `HttpResult` 恢复错误，也可以抛出新错误替换当前错误。
   * 如果所有错误拦截器都没有恢复错误，最后会抛出最新的错误对象。
   *
   * @template TData 响应体类型。
   * @template TBody 请求体类型。
   * @param error 当前错误对象。
   * @param state 当前原始请求的 retry 状态。
   * @param config 当前请求最终配置；如果错误发生在请求拦截器阶段，可能为空。
   * @returns 被错误拦截器恢复后的完整请求结果。
   * @throws unknown 所有错误拦截器处理后仍未恢复的错误。
   * @internal
   */
  private async applyErrorInterceptors<TData, TBody>(
    error: unknown,
    state: HttpExecutionState<TBody>,
    config?: HttpResolvedRequestConfig<TBody>,
  ): Promise<HttpResult<TData, TBody>> {
    let currentError = error
    const context = this.createErrorContext<TBody>(state, config)

    for (const interceptor of this.interceptors.error.list()) {
      try {
        const recoveredResult = await interceptor(currentError, context as HttpErrorInterceptorContext)
        if (recoveredResult) {
          return recoveredResult as HttpResult<TData, TBody>
        }
      }
      catch (nextError) {
        currentError = nextError
      }
    }

    throw currentError
  }

  /**
   * 创建错误拦截器上下文。
   *
   * 这里集中实现“只允许重试一次”：
   * - 第一次调用 retry 时标记 `state.retried = true`。
   * - 第二次调用 retry 时直接抛错，阻止 401 refresh 等场景无限循环。
   *
   * @template TBody 请求体类型。
   * @param state 当前原始请求的 retry 状态。
   * @param config 当前请求最终配置。
   * @returns 错误拦截器上下文。
   * @internal
   */
  private createErrorContext<TBody>(
    state: HttpExecutionState<TBody>,
    config?: HttpResolvedRequestConfig<TBody>,
  ): HttpErrorInterceptorContext<TBody> {
    return {
      get retried() {
        return state.retried
      },
      originalConfig: state.originalConfig,
      config,
      retry: async <TData = unknown>(overrideConfig: Partial<HttpRequestConfig<TBody>> = {}) => {
        if (state.retried) {
          throw new Error('当前请求已经重试过，已阻止重复重试以避免无限循环')
        }

        state.retried = true
        const retryConfig = this.mergeRetryConfig(state.originalConfig, overrideConfig)
        return this.execute<TData, TBody>(retryConfig, state)
      },
    }
  }

  /**
   * 合并 retry 覆盖配置。
   *
   * 普通字段使用浅合并；headers 单独合并，避免 retry 时只传 Authorization 就丢失原始 headers。
   *
   * @template TBody 请求体类型。
   * @param originalConfig 原始请求配置。
   * @param overrideConfig retry 覆盖配置。
   * @returns retry 实际使用的请求配置。
   * @internal
   */
  private mergeRetryConfig<TBody>(
    originalConfig: HttpRequestConfig<TBody>,
    overrideConfig: Partial<HttpRequestConfig<TBody>>,
  ): HttpRequestConfig<TBody> {
    return {
      ...originalConfig,
      ...overrideConfig,
      headers: mergeHeaders(originalConfig.headers, overrideConfig.headers),
    }
  }

  /**
   * 将用户请求配置归一化为 fetch 最终执行配置。
   *
   * @template TBody 请求体类型。
   * @param config 用户请求配置。
   * @returns 最终执行配置。
   * @internal
   */
  private resolveConfig<TBody>(config: HttpRequestConfig<TBody>): HttpResolvedRequestConfig<TBody> {
    const method = config.method ?? 'GET'
    const baseURL = config.baseURL ?? this.defaults.baseURL ?? ''
    const timeout = config.timeout ?? this.defaults.timeout
    const responseType = config.responseType ?? this.defaults.responseType ?? 'json'
    const requestUrl = appendParams(joinUrl(baseURL, config.url), config.params)
    const body = this.createBody(config.body)
    const headers = this.createHeaders(config.headers, body.isJson)
    const requestInit: RequestInit = {
      method,
      headers,
      body: body.value,
      credentials: config.credentials ?? this.defaults.credentials,
      cache: config.cache ?? this.defaults.cache,
      mode: config.mode ?? this.defaults.mode,
      redirect: config.redirect ?? this.defaults.redirect,
      referrerPolicy: config.referrerPolicy ?? this.defaults.referrerPolicy,
    }

    return {
      ...config,
      method,
      baseURL,
      timeout,
      responseType,
      requestUrl,
      headers,
      requestInit,
    }
  }

  /**
   * 创建 fetch 请求体。
   *
   * @param body 用户传入请求体。
   * @returns fetch 可接受的 body 以及是否按 JSON body 处理。
   * @internal
   */
  private createBody(body: unknown): { value?: BodyInit, isJson: boolean } {
    if (body === undefined || body === null) {
      return { isJson: false }
    }

    if (isBodyInit(body)) {
      return { value: body, isJson: false }
    }

    return {
      value: JSON.stringify(body),
      isJson: true,
    }
  }

  /**
   * 创建最终请求 headers。
   *
   * @param headersInput 单次请求 headers。
   * @param isJsonBody 当前请求体是否由库序列化为 JSON。
   * @returns 合并默认 headers 后的 Headers 实例。
   * @internal
   */
  private createHeaders(headersInput: HeadersInit | undefined, isJsonBody: boolean): Headers {
    const headers = mergeHeaders(this.defaults.headers, headersInput)

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    if (isJsonBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json;charset=utf-8')
    }

    return headers
  }

  /**
   * 按 responseType 解析响应。
   *
   * 这里不做业务成功/失败判断；HTTP 2xx 以外的错误判断在调用方拿到解析结果后进行，
   * 这样 `HttpError.data` 可以包含服务端返回的错误响应体。
   *
   * @param response 原始 Fetch Response。
   * @param responseType 响应解析方式。
   * @returns 已解析响应体。
   * @internal
   */
  private async parseResponse(response: Response, responseType: HttpResponseType): Promise<unknown> {
    if (responseType === 'response') {
      return response
    }
    if (responseType === 'stream') {
      return response.body
    }
    if (response.status === 204 || response.status === 205) {
      return null
    }
    if (responseType === 'blob') {
      return response.blob()
    }
    if (responseType === 'arrayBuffer') {
      return response.arrayBuffer()
    }
    if (responseType === 'formData') {
      return response.formData()
    }

    const text = await response.text()
    if (responseType === 'text') {
      return text
    }

    return tryParseJson(text)
  }
}

/**
 * 默认 HTTP 客户端实例。
 *
 * 无 baseURL、无业务逻辑，适合简单请求或作为示例入口。
 *
 * @public
 */
export const http = new HttpClient()

/**
 * 默认 HTTP 客户端的 request 方法快捷导出。
 *
 * @public
 */
export const request = http.request.bind(http)
