import type { HttpParams } from './types'

/**
 * 判断 URL 是否为 http/https 绝对地址。
 *
 * @param url - 待判断 URL。
 * @returns 如果 URL 以 `http://` 或 `https://` 开头，返回 true。
 * @internal
 */
export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}

/**
 * 拼接 baseURL 与业务 URL。
 *
 * 完整 HTTP URL 会直接返回，不会再追加 baseURL；相对路径会自动补齐 `/`。
 *
 * @param baseURL - 客户端默认或单次请求覆盖的 baseURL。
 * @param url - 请求路径或完整 URL。
 * @returns 最终未拼接 query 的 URL。
 * @internal
 */
export function joinUrl(baseURL: string, url: string): string {
  if (!baseURL || isAbsoluteHttpUrl(url)) {
    return url
  }

  return `${baseURL.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

/**
 * 向 URLSearchParams 追加单个 query 值。
 *
 * 序列化规则：
 * - `undefined`、`null`、空字符串会被忽略。
 * - 数组会递归追加为重复 key。
 * - Date 会序列化为 ISO 字符串。
 *
 * @param searchParams - URLSearchParams 实例。
 * @param key - query 参数名。
 * @param value - query 参数值。
 * @internal
 */
function appendQueryValue(searchParams: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null || value === '') {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendQueryValue(searchParams, key, item)
    }
    return
  }

  searchParams.append(key, value instanceof Date ? value.toISOString() : String(value))
}

/**
 * 将 params 合并进 URL。
 *
 * 不使用 `new URL(url)` 是为了兼容 `/api/users` 这类相对路径。
 * hash 会保留在最终 URL 末尾，避免 query 被追加到 hash 后面。
 *
 * @param url - 已拼接 baseURL 的 URL。
 * @param params - query 参数集合。
 * @returns 追加 query 后的 URL。
 * @internal
 */
export function appendParams(url: string, params?: HttpParams): string {
  if (!params) {
    return url
  }

  const hashIndex = url.indexOf('#')
  const urlWithoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const queryIndex = urlWithoutHash.indexOf('?')
  const path = queryIndex >= 0 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash
  const query = queryIndex >= 0 ? urlWithoutHash.slice(queryIndex + 1) : ''
  const searchParams = new URLSearchParams(query)

  for (const [key, value] of Object.entries(params)) {
    appendQueryValue(searchParams, key, value)
  }

  const queryString = searchParams.toString()
  return `${path}${queryString ? `?${queryString}` : ''}${hash}`
}

/**
 * 判断传入请求体是否已经是 fetch 原生可接受的 BodyInit。
 *
 * @param body - 调用方传入的请求体。
 * @returns 如果 body 可以直接传给 fetch，返回 true。
 * @internal
 */
export function isBodyInit(body: unknown): body is BodyInit {
  return body instanceof Blob
    || body instanceof FormData
    || body instanceof URLSearchParams
    || body instanceof ArrayBuffer
    || ArrayBuffer.isView(body)
    || body instanceof ReadableStream
    || typeof body === 'string'
}

/**
 * 合并默认 headers 与单次请求 headers。
 *
 * @param defaultHeaders - 客户端默认 headers。
 * @param requestHeaders - 单次请求 headers。
 * @returns 合并后的 Headers 实例；同名 header 以单次请求为准。
 * @internal
 */
export function mergeHeaders(defaultHeaders?: HeadersInit, requestHeaders?: HeadersInit): Headers {
  const headers = new Headers(defaultHeaders)
  new Headers(requestHeaders).forEach((value, key) => headers.set(key, value))
  return headers
}

/**
 * 合并外部 AbortSignal 与内部 timeout。
 *
 * fetch 只能接收一个 signal，因此这里创建内部 AbortController：
 * - 外部 signal abort 时，内部 controller 跟随 abort。
 * - timeout 到期时，内部 controller abort。
 * - 请求结束后 cleanup 会移除事件监听和计时器。
 *
 * @param signal - 调用方传入的取消信号。
 * @param timeout - 超时时间，单位毫秒。
 * @returns 合并后的 signal 与清理函数。
 * @internal
 */
export function createAbortSignal(signal?: AbortSignal, timeout?: number): { signal?: AbortSignal, cleanup: () => void } {
  if (!signal && (!timeout || timeout <= 0)) {
    return { cleanup: () => undefined }
  }

  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const abortFromExternalSignal = (): void => controller.abort(signal?.reason)

  if (signal?.aborted) {
    abortFromExternalSignal()
  }
  else {
    signal?.addEventListener('abort', abortFromExternalSignal, { once: true })
  }

  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(new Error('请求超时')), timeout)
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      signal?.removeEventListener('abort', abortFromExternalSignal)
    },
  }
}

/**
 * 尝试把字符串解析成 JSON。
 *
 * @param text - 响应文本。
 * @returns JSON 解析结果；空字符串返回 null；解析失败返回原始字符串。
 * @internal
 */
export function tryParseJson(text: string): unknown {
  if (!text.trim()) {
    return null
  }

  try {
    return JSON.parse(text)
  }
  catch {
    return text
  }
}
