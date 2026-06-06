import { defineMock } from '../base'

export default defineMock({
  url: 'search',
  method: 'POST',
  body: ({ body }) => {
    const keyword = (body as { keyword?: string })?.keyword?.trim() ?? ''
    const all = [
      { id: '1', title: 'Button 按钮', category: '基础组件', desc: '触发操作的基础交互元素' },
      { id: '2', title: 'Input 输入框', category: '基础组件', desc: '用于文本输入的表单控件' },
      { id: '3', title: 'Select 选择器', category: '基础组件', desc: '下拉选择单个或多个选项' },
      { id: '4', title: 'TopNav 顶部导航', category: '布局组件', desc: '顶部水平导航栏布局' },
      { id: '5', title: 'Sidebar 侧边栏', category: '布局组件', desc: '左侧折叠侧边栏布局' },
      { id: '6', title: 'Table 表格', category: '数据展示', desc: '结构化展示行列数据' },
      { id: '7', title: 'Card 卡片', category: '数据展示', desc: '信息聚合的容器卡片' },
      { id: '8', title: 'Toast 提示', category: '反馈组件', desc: '轻量级操作反馈提示' },
      { id: '9', title: 'Modal 弹窗', category: '反馈组件', desc: '需要用户确认的对话框' },
    ]

    const result = keyword
      ? all.filter(
          item =>
            item.title.toLowerCase().includes(keyword.toLowerCase())
            || item.category.includes(keyword)
            || item.desc.includes(keyword),
        )
      : all

    return {
      keyword,
      total: result.length,
      items: result,
    }
  },
})
