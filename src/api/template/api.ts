import type {
  AuthResponse,
  EchoRequest,
  EchoResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
  Status,
} from './types'
import { buildApiUrl } from '@/api/client'
import { request } from '@/utils/http'

/** 获取示例状态。 */
export function fetchStatus(): Promise<Status> {
  return request<Status>({
    url: buildApiUrl('/api/template/status'),
    method: 'GET',
  })
}

/** Echo 示例，用于验证请求体和 mock 链路。 */
export function echo(payload: EchoRequest): Promise<EchoResponse> {
  return request<EchoResponse, EchoRequest>({
    url: buildApiUrl('/api/template/echo'),
    method: 'POST',
    body: payload,
  })
}

/** 登录示例接口；只用于工作台模板演示弹窗鉴权流程。 */
export function login(payload: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse, LoginRequest>({
    url: buildApiUrl('/api/template/auth/login'),
    method: 'POST',
    body: payload,
  })
}

/** 注册示例接口；返回和登录一致的本地模拟用户。 */
export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse, RegisterRequest>({
    url: buildApiUrl('/api/template/auth/register'),
    method: 'POST',
    body: payload,
  })
}

/** 登出示例接口；真实项目应在这里清理服务端会话或 token。 */
export function logout(): Promise<LogoutResponse> {
  return request<LogoutResponse>({
    url: buildApiUrl('/api/template/auth/logout'),
    method: 'POST',
  })
}
