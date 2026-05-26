/**
 * 基于原生 fetch 的 HTTP 客户端公共入口。
 *
 * 本文件只导出稳定的运行时 API 和公共类型；具体实现细节保留在
 * `request.ts`、`interceptors.ts`、`debug.ts` 内部维护。
 */
export { createHttpDebugger, silentHttpDebugger } from './debug.ts'
export { HttpError } from './error.ts'
export { createHttpInterceptors, HttpInterceptorManager } from './interceptors.ts'
export { http, HttpClient, request } from './request.ts'
export type {
  HttpBodyRequestOptions,
  HttpClientOptions,
  HttpDebugErrorPayload,
  HttpDebugLogger,
  HttpDebugResponsePayload,
  HttpErrorInterceptor,
  HttpErrorInterceptorContext,
  HttpErrorMeta,
  HttpInterceptorManager as HttpInterceptorManagerContract,
  HttpInterceptors,
  HttpMethod,
  HttpParams,
  HttpQueryValue,
  HttpRequestBody,
  HttpRequestConfig,
  HttpRequestError,
  HttpRequestInterceptor,
  HttpRequestOptions,
  HttpResolvedRequestConfig,
  HttpResponseInterceptor,
  HttpResponseType,
  HttpResult,
  MaybePromise,
} from './types.ts'
