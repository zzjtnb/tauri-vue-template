import { defineMock } from '../base'

export default defineMock({
  url: 'components',
  method: 'GET',
  body: {
    categories: [
      {
        id: 'basic',
        name: '基础组件',
        components: ['Button', 'Input', 'Select', 'Checkbox', 'Radio'],
      },
      {
        id: 'layout',
        name: '布局组件',
        components: ['TopNav', 'Sidebar', 'Hybrid', 'Blank'],
      },
      {
        id: 'data',
        name: '数据展示',
        components: ['Table', 'Card', 'List', 'Tree'],
      },
      {
        id: 'feedback',
        name: '反馈组件',
        components: ['Alert', 'Toast', 'Modal', 'Drawer'],
      },
    ],
    total: 18,
  },
})
