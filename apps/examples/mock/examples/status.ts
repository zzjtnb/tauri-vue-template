import { defineMock } from '../base'

export default defineMock({
  url: 'status',
  method: 'GET',
  body: {
    name: 'Tauri Vue Examples',
    version: '0.1.0',
    message: '示例 Mock 服务运行正常',
    features: [
      'shadcn-vue 组件',
      '布局系统',
      'Logo 编辑器',
      '字体系统',
      '主题配色',
      '虚拟信用卡',
    ],
    updatedAt: new Date().toISOString(),
  },
})
