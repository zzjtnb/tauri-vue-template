import type { MockHttpItem, MockWebsocketItem } from 'vite-plugin-mock-dev-server'
import path from 'node:path'
import { createDefineMock } from 'vite-plugin-mock-dev-server'

/** 示例 Mock 默认挂在 /api/examples 下，避免与模板应用路径冲突。 */
export const defineMock = createDefineMock((mock: MockHttpItem | MockWebsocketItem) => {
  mock.url = path.posix.join(import.meta.env.VITE_APP_BASE_API || '/dev-api', '/api/examples/', mock.url)
})
