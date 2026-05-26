import type { AuthBody } from './types'
import { defineMock } from '../../base'

const body: AuthBody = {
  token: 'template-demo-token',
  user: {
    id: 'template-user-1',
    name: '模板用户',
    email: 'demo@example.com',
  },
  issuedAt: '2026-05-25T00:00:00.000Z',
}

export default defineMock({
  url: 'auth/login',
  method: 'POST',
  body,
})
