import type { MockHttpItem, MockWebsocketItem } from 'vite-plugin-mock-dev-server'
import path from 'node:path'
import process from 'node:process'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

function resolveMockBaseApi(): string {
  return process.env.VITE_APP_BASE_API?.trim() || ''
}

/** 模板 Mock 默认挂在 /api/template 下，避免携带任何旧业务路径。 */
export const defineMock = createDefineMock((mock: MockHttpItem | MockWebsocketItem) => {
  mock.url = path.posix.join(resolveMockBaseApi(), '/api/template/', mock.url)
})
