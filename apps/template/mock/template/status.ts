import { defineMock } from '../base'

export default defineMock({
  url: 'status',
  method: 'GET',
  body: {
    name: 'Tauri Vue Template',
    version: '0.1.0',
    message: '模板 Mock 服务运行正常',
    features: [
      'Vue 3',
      'Tauri 2',
      'UnoCSS',
      'shadcn-vue',
      'Mock API',
    ],
    updatedAt: '2026-05-23T00:00:00.000Z',
  },
})
