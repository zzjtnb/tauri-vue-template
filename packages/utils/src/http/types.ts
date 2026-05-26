/** HTTP 方法。 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * 响应解析方式。
 *
 * - `json`：读取 text 后尝试 JSON.parse，解析失败时返回原始 text。
 * - `text`：返回字符串。
 * - `blob`：返回 Blob。
 * - `arrayBuffer`：返回 ArrayBuffer。
 * - `formData`：返回 FormData。
 * - `stream`：返回 ReadableStream 或 null。
 * - `response`：返回原始 Response。
 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'stream' | 'response'

/** 单个 query 参数允许的值。 */
export type HttpQueryValue = string | number | boolean | Date | null | undefined

/** Query 参数集合；数组会被序列化为重复 key。 */
export type HttpParams = Record<string, HttpQueryValue | HttpQueryValue[]>

/** 请求体输入类型。使用 unknown 保持通用库对调用方数据结构的开放性。 */
export type HttpRequestBody = unknown

/** 同时支持同步和异步拦截器返回值。 */
export type MaybePromise<T> = T | Promise<T>

/**
 * 单次请求配置。
 *
 * 这是通用 HTTP 配置，不包含任何业务协议字段。
 * 如果接口返回 `{ code, data, message }` 之类业务结构，应由调用方在 API 层自行解析。
 *
 * @template TBody 请求体类型。
 * @public
 */
export interface HttpRequestConfig<TBody = HttpRequestBody> {
  /** 接口路径或完整 URL。相对路径会与 baseURL 拼接。 */
  url: string
  /** HTTP 方法；未传时默认 GET。 */
  method?: HttpMethod
  /** 本次请求覆盖默认 baseURL。 */
  baseURL?: string
  /** URL 查询参数；数组会按重复 key 输出，例如 `ids=1&ids=2`。 */
  params?: HttpParams
  /** 请求体；普通对象/数组默认 JSON 序列化，原生 BodyInit 保持原样。 */
  body?: TBody
  /** 本次请求追加或覆盖默认 headers。 */
  headers?: HeadersInit
  /** 外部取消信号；会与 timeout 生成的内部信号合并。 */
  signal?: AbortSignal
  /** 请求超时时间，单位毫秒；不传或小于等于 0 表示不启用超时。 */
  timeout?: number
  /** 透传 fetch credentials。 */
  credentials?: RequestCredentials
  /** 透传 fetch cache。 */
  cache?: RequestCache
  /** 透传 fetch mode。 */
  mode?: RequestMode
  /** 透传 fetch redirect。 */
  redirect?: RequestRedirect
  /** 透传 fetch referrerPolicy。 */
  referrerPolicy?: ReferrerPolicy
  /** 响应解析方式；默认 json。 */
  responseType?: HttpResponseType
}

/**
 * GET/DELETE/HEAD/OPTIONS 快捷方法配置。
 *
 * 快捷方法已经通过参数提供 `url`、`method`，并且这些方法不携带 body，
 * 因此这里显式移除 `url`、`method`、`body`，防止调用方传入相互冲突的配置。
 */
export type HttpRequestOptions = Omit<HttpRequestConfig<never>, 'url' | 'method' | 'body'>

/**
 * POST/PUT/PATCH 快捷方法配置。
 *
 * 快捷方法已经通过参数提供 `url`、`method`、`body`，
 * 因此这里显式移除这三个字段，保持调用 API 清晰。
 *
 * @template TBody 请求体类型。
 */
export type HttpBodyRequestOptions<TBody = HttpRequestBody> = Omit<HttpRequestConfig<TBody>, 'url' | 'method' | 'body'>

/**
 * HttpClient 构造配置。
 *
 * 这些选项作为客户端默认值存在，单次请求可以用 {@link HttpRequestConfig} 覆盖其中一部分。
 *
 * @public
 */
export interface HttpClientOptions {
  /** 默认 baseURL。 */
  baseURL?: string
  /** 默认超时时间，单位毫秒。 */
  timeout?: number
  /** 默认 headers。 */
  headers?: HeadersInit
  /** 默认 credentials。 */
  credentials?: RequestCredentials
  /** 默认 cache。 */
  cache?: RequestCache
  /** 默认 mode。 */
  mode?: RequestMode
  /** 默认 redirect。 */
  redirect?: RequestRedirect
  /** 默认 referrerPolicy。 */
  referrerPolicy?: ReferrerPolicy
  /** 默认响应解析方式。 */
  responseType?: HttpResponseType
  /** 是否输出完整调试日志；默认 false。 */
  debug?: boolean
  /** 自定义日志对象；默认 console。 */
  logger?: Pick<Console, 'info' | 'error'>
}

/**
 * 内部归一化后的请求快照。
 *
 * debug 与错误对象使用这个结构展示“最终实际请求”：method 已补齐、baseURL 已拼接、
 * params 已写入 requestUrl、headers 已合并、body 已转成 fetch 可接受的 BodyInit。
 *
 * @template TBody 请求体类型。
 */
export interface HttpResolvedRequestConfig<TBody = HttpRequestBody> extends Omit<HttpRequestConfig<TBody>, 'headers'> {
  /** 最终 HTTP 方法。 */
  method: HttpMethod
  /** 拼接 baseURL 与 params 后的最终请求地址。 */
  requestUrl: string
  /** 合并默认 headers 和单次请求 headers 后的 Headers 实例。 */
  headers: Headers
  /** 最终传给 fetch 的 RequestInit。 */
  requestInit: RequestInit
}

/**
 * 请求成功后的完整结果。
 *
 * @template TData 已解析响应体类型。
 * @template TBody 请求体类型。
 * @public
 */
export interface HttpResult<TData = unknown, TBody = HttpRequestBody> {
  /** 已按 responseType 解析后的响应体。 */
  data: TData
  /** 原始 Fetch Response。 */
  response: Response
  /** 当前请求最终执行配置。 */
  config: HttpResolvedRequestConfig<TBody>
}

/**
 * 创建 HttpError 所需的元信息。
 *
 * @template TBody 请求体类型。
 */
export interface HttpErrorMeta<TBody = HttpRequestBody> {
  /** 错误消息。 */
  message: string
  /** 请求方法。 */
  method: HttpMethod
  /** 最终请求 URL。 */
  url: string
  /** HTTP 状态码；网络错误如果未进入 Response 阶段不会构造 HttpError。 */
  status: number
  /** 已解析响应体，通常是错误响应。 */
  data?: unknown
  /** 原始 Response。 */
  response?: Response
  /** 最终请求配置。 */
  config?: HttpResolvedRequestConfig<TBody>
}

/**
 * 对外暴露的请求错误结构。
 *
 * 运行时类由 `request.ts` 的 `HttpError` 提供；这里保留接口是为了让类型层不依赖具体实现类。
 *
 * @template TBody 请求体类型。
 * @public
 */
export interface HttpRequestError<TBody = HttpRequestBody> extends Error {
  /** 请求方法。 */
  method: HttpMethod
  /** 最终请求 URL。 */
  url: string
  /** HTTP 状态码。 */
  status: number
  /** 已解析错误响应体。 */
  data?: unknown
  /** 原始 Response。 */
  response?: Response
  /** 最终请求配置。 */
  config?: HttpResolvedRequestConfig<TBody>
}

/**
 * 错误拦截器上下文。
 *
 * `retry` 是库层提供的安全重试入口：同一个原始请求只允许重试一次。
 * 这用于 token refresh、瞬时网络错误恢复等场景，防止拦截器递归触发无限循环。
 *
 * @template TBody 请求体类型。
 * @public
 */
export interface HttpErrorInterceptorContext<TBody = HttpRequestBody> {
  /** 当前原始请求是否已经调用过 retry。 */
  readonly retried: boolean
  /** 本次请求最初传入的配置。 */
  readonly originalConfig: HttpRequestConfig<TBody>
  /** 已经归一化并实际执行的配置；如果错误发生在请求拦截器阶段，可能为空。 */
  readonly config?: HttpResolvedRequestConfig<TBody>
  /**
   * 安全重试当前请求。
   *
   * 同一个原始请求第二次调用会直接抛错，避免错误拦截器无限递归。
   *
   * @template TData 重试后响应体类型。
   * @param overrideConfig 重试时覆盖原始请求的配置，headers 会与原始 headers 合并。
   * @returns 重试后的完整请求结果。
   */
  retry: <TData = unknown>(overrideConfig?: Partial<HttpRequestConfig<TBody>>) => Promise<HttpResult<TData, TBody>>
}

/**
 * 请求拦截器。
 *
 * 返回新的 config 会进入后续请求链；返回 void 表示沿用当前 config。
 *
 * @template TBody 请求体类型。
 */
export type HttpRequestInterceptor<TBody = HttpRequestBody> = (config: HttpRequestConfig<TBody>) => MaybePromise<HttpRequestConfig<TBody> | void>

/**
 * 响应拦截器。
 *
 * 仅在 HTTP 2xx 时执行。返回新的 result 会进入后续响应链；返回 void 表示沿用当前 result。
 */
export type HttpResponseInterceptor = (result: HttpResult) => MaybePromise<HttpResult | void>

/**
 * 错误拦截器。
 *
 * 可以返回 HttpResult 恢复错误，也可以抛出新错误替换当前错误。
 */
export type HttpErrorInterceptor = (error: unknown, context: HttpErrorInterceptorContext) => MaybePromise<HttpResult | void>

/**
 * 拦截器管理器契约。
 *
 * 运行时实现位于 `interceptors.ts`。
 *
 * @template THandler 拦截器函数类型。
 * @public
 */
export interface HttpInterceptorManager<THandler> {
  /** 注册拦截器并返回 id。 */
  use: (handler: THandler) => number
  /** 根据 id 移除拦截器。 */
  eject: (id: number) => boolean
  /** 清空当前类型的所有拦截器。 */
  clear: () => void
  /** 返回当前拦截器快照。 */
  list: () => THandler[]
}

/** HttpClient 暴露的三类拦截器。 */
export interface HttpInterceptors {
  /** 请求发送前执行。 */
  request: HttpInterceptorManager<HttpRequestInterceptor>
  /** HTTP 2xx 响应解析后执行。 */
  response: HttpInterceptorManager<HttpResponseInterceptor>
  /** 请求链任意阶段出错后执行。 */
  error: HttpInterceptorManager<HttpErrorInterceptor>
}

/** 调试器接口。debug.ts 提供默认实现，调用方也可以自定义完整日志输出。 */
export interface HttpDebugLogger {
  /** 请求发出前调用。 */
  request: (config: HttpResolvedRequestConfig) => void
  /** 响应解析后调用。 */
  response: (payload: HttpDebugResponsePayload) => void
  /** 请求链异常时调用。 */
  error: (payload: HttpDebugErrorPayload) => void
}

/** 调试响应载荷。 */
export interface HttpDebugResponsePayload {
  /** 当前请求最终执行配置。 */
  config: HttpResolvedRequestConfig
  /** HTTP 状态码。 */
  status: number
  /** 已解析响应体。 */
  data: unknown
}

/** 调试错误载荷。 */
export interface HttpDebugErrorPayload {
  /** 当前请求最终执行配置；如果错误发生在归一化前，可能为空。 */
  config?: HttpResolvedRequestConfig
  /** 原始错误对象。 */
  error: unknown
}
