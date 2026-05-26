import type { LayoutRouteModule } from '@tauri-vue-template/ui'

export const shadcnShowcaseRoutes: LayoutRouteModule = [
  {
    path: 'shadcn',
    redirect: { name: 'shadcn' },
    meta: {
      title: 'UI 组件',
      icon: 'i-lucide-package',
      order: 930,
      breadcrumb: true,
      alwaysShow: true,
      layout: 'sidebar',
    },
    children: [
      {
        path: '',
        name: 'shadcn',
        component: () => import('@/views/shadcn/index.vue'),
        meta: {
          title: '组件总览',
          icon: 'i-lucide-package',
          order: 931,
          breadcrumb: true,
        },
      },
      {
        path: 'foundation',
        name: 'shadcn-foundation',
        redirect: { name: 'shadcn-basic' },
        meta: {
          title: '基础与表单',
          icon: 'i-lucide-package',
          order: 932,
          description: '基础视觉元素和输入控件示例',
          breadcrumb: true,
          alwaysShow: true,
        },
        children: [
          {
            path: 'basic',
            name: 'shadcn-basic',
            component: () => import('@/views/shadcn/basic/index.vue'),
            meta: {
              title: '基础组件',
              icon: 'i-lucide-package',
              order: 933,
              description: '按钮、徽章、面包屑、折叠区和导航菜单',
              breadcrumb: true,
            },
          },
          {
            path: 'forms',
            name: 'shadcn-forms',
            component: () => import('@/views/shadcn/forms/index.vue'),
            meta: {
              title: '表单组件',
              icon: 'i-lucide-file-pen-line',
              order: 934,
              description: '输入框、选择器、日期、验证码和步骤条',
              breadcrumb: true,
            },
          },
        ],
      },
      {
        path: 'surface',
        name: 'shadcn-surface',
        redirect: { name: 'shadcn-data' },
        meta: {
          title: '展示与反馈',
          icon: 'i-lucide-panels-top-left',
          order: 940,
          description: '数据展示、空状态、加载态和消息反馈',
          breadcrumb: true,
          alwaysShow: true,
        },
        children: [
          {
            path: 'data',
            name: 'shadcn-data',
            component: () => import('@/views/shadcn/data/index.vue'),
            meta: {
              title: '数据展示',
              icon: 'i-lucide-table-2',
              order: 941,
              description: '表格、卡片、分页和滚动区域',
              breadcrumb: true,
            },
          },
          {
            path: 'feedback',
            name: 'shadcn-feedback',
            component: () => import('@/views/shadcn/feedback/index.vue'),
            meta: {
              title: '反馈组件',
              icon: 'i-lucide-bell-ring',
              order: 942,
              description: 'Alert、Progress、Spinner、Skeleton、Empty 和 Sonner',
              breadcrumb: true,
            },
          },
        ],
      },
      {
        path: 'interaction',
        name: 'shadcn-interaction',
        redirect: { name: 'shadcn-overlay' },
        meta: {
          title: '交互与高级',
          icon: 'i-lucide-gauge',
          order: 950,
          description: '浮层交互、命令面板和复杂组合组件',
          breadcrumb: true,
          alwaysShow: true,
        },
        children: [
          {
            path: 'overlay',
            name: 'shadcn-overlay',
            component: () => import('@/views/shadcn/overlay/index.vue'),
            meta: {
              title: '浮层组件',
              icon: 'i-lucide-panel-top-open',
              order: 951,
              description: 'Dialog、菜单、Popover、Tooltip、Drawer、Sheet 和 Command',
              breadcrumb: true,
            },
          },
          {
            path: 'advanced',
            name: 'shadcn-advanced',
            component: () => import('@/views/shadcn/advanced/index.vue'),
            meta: {
              title: '高级组件',
              icon: 'i-lucide-chart-line',
              order: 952,
              description: 'Chart、Carousel、Sidebar 和 Resizable 组合能力',
              breadcrumb: true,
            },
          },
        ],
      },
    ],
  },
]

export const shadcnEntries = (shadcnShowcaseRoutes[0].children ?? [])
  .filter(group => group.children?.length)
  .map(group => ({
    title: group.meta?.title ?? '',
    description: group.meta?.description ?? '',
    icon: group.meta?.icon ?? '',
    pages: (group.children ?? []).map(page => ({
      to: `/shadcn/${group.path}/${page.path}`,
      title: page.meta?.title ?? '',
      description: page.meta?.description ?? '',
      icon: page.meta?.icon ?? '',
    })),
  }))
