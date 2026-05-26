import type { LogoutBody } from './types'
import { defineMock } from '../../base'

const body: LogoutBody = {
  ok: true,
  message: '模板用户已登出',
  loggedOutAt: '2026-05-25T00:00:00.000Z',
}

export default defineMock({
  url: 'auth/logout',
  method: 'POST',
  body,
})
