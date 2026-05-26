import type { MockRequest } from 'vite-plugin-mock-dev-server'
import { defineMock } from '../base'

function resolveEchoText(body: MockRequest['body']): string {
  const payload = body as Record<string, unknown>
  return typeof payload.text === 'string' ? payload.text : ''
}

export default defineMock({
  url: 'echo',
  method: 'POST',
  body: (request: MockRequest) => ({
    text: resolveEchoText(request.body),
    echoedAt: '2026-05-23T00:00:00.000Z',
  }),
})
