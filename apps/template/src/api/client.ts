import type { TemplateApiRequestParams } from '@/api/types'

/** 归一化基础地址，保证后续拼接路径时不会出现重复斜杠。 */
function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/$/, '')
}

/** 判断是否为 http/https 绝对地址。 */
function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value)
}

/** 统一把接口路径归一成以 `/` 开头的 path。 */
function normalizeApiPath(path: string): string {
  if (isAbsoluteHttpUrl(path)) {
    try {
      const url = new URL(path)
      return `${url.pathname}${url.search}`
    }
    catch {
      return path
    }
  }

  return path.startsWith('/') ? path : `/${path}`
}

/** 将查询参数拼接到 URL，不发起真实请求。 */
function appendApiParams(url: string, params?: TemplateApiRequestParams): string {
  if (!params) {
    return url
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, item instanceof Date ? item.toISOString() : String(item))
        }
      }
      continue
    }
    searchParams.append(key, value instanceof Date ? value.toISOString() : String(value))
  }

  const queryString = searchParams.toString()
  if (!queryString) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`
}

/**
 * 模板 API 基础地址。
 *
 * 开发时可用 `VITE_APP_BASE_API=/dev-api` 交给 Vite proxy 或 mock server；
 * 生产或 Tauri 静态包内可用 `VITE_APP_API_URL` 直连真实后端。
 */
export function resolveApiBaseUrl(): string {
  const requestBase = import.meta.env.VITE_APP_BASE_API?.trim()
  const apiUrl = import.meta.env.VITE_APP_API_URL?.trim()

  if (requestBase) {
    return normalizeBaseUrl(requestBase)
  }

  if (apiUrl) {
    return normalizeBaseUrl(apiUrl)
  }

  return ''
}

/** 拼接 API 地址和查询参数，不发起真实请求。 */
export function buildApiUrl(path: string, params?: TemplateApiRequestParams): string {
  const normalizedPath = normalizeApiPath(path)
  const baseURL = resolveApiBaseUrl()
  const baseUrlWithPath = isAbsoluteHttpUrl(path)
    ? path
    : `${baseURL}${normalizedPath}`

  return appendApiParams(baseUrlWithPath, params)
}

/**
 * 模板默认不内置登录态；保留空 token 读取入口，方便后续业务扩展原生上传或鉴权请求。
 */
export function getAccessToken(): string {
  return ''
}
