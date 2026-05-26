import { defineMock } from '../base'

export default defineMock({
  url: 'upload',
  method: 'POST',
  body: {
    ok: true,
    message: '模板上传 Mock 接收成功',
    uploadedAt: '2026-05-24T00:00:00.000Z',
  },
})
