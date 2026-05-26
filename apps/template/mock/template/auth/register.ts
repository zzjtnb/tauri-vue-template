import type { AuthBody } from './types'
import { defineMock } from '../../base'

const body: AuthBody = {
  token: 'template-demo-token',
  user: {
    id: 'template-user-1',
    name: '新模板用户',
    email: 'new-demo@example.com',
  },
  issuedAt: '2026-05-25T00:00:00.000Z',
}

export default defineMock({
  url: 'auth/register',
  method: 'POST',
  body,
})
