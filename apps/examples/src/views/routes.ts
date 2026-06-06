import type { LayoutRouteModule } from '@tauri-vue-template/ui'
import { RouterView } from 'vue-router'
import { layoutShowcaseRoute } from '@/views/layout/routes'
import { shadcnShowcaseRoutes } from '@/views/shadcn/routes'

/** 示例展示路由；统一承载字体、主题、组件和布局系统演示。 */
export const pageRoutes: LayoutRouteModule = [
  {
    path: '',
    name: 'pages',
    component: RouterView,
    meta: {
      title: '示例展示',
      icon: 'i-lucide-blocks',
      order: 900,
      affix: true,
      description: '字体、主题、组件、工具和布局的展示页面',
      requiresAuth: false,
      layout: 'sidebar',
    },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/index.vue'),
        meta: {
          title: '示例总览',
          icon: 'i-lucide-blocks',
          order: 901,
          description: '示例展示入口总览',
        },
      },
      {
        path: 'fonts',
        name: 'fonts',
        component: () => import('@/views/fonts.vue'),
        meta: {
          title: '字体系统',
          icon: 'i-lucide-type',
          description: '项目字体展示',
        },
      },
      {
        path: 'themes',
        name: 'themes',
        component: () => import('@/views/themes/index.vue'),
        meta: {
          title: '主题配色',
          icon: 'i-lucide-palette',
          description: '六套主题色和语义 token 展示',
        },
      },
      {
        ...shadcnShowcaseRoutes[0],
      },
      {
        path: 'card',
        name: 'card',
        component: () => import('@/views/card/index.vue'),
        meta: {
          title: '虚拟信用卡',
          icon: 'i-lucide-credit-card',
          description: '虚拟信用卡生成和验证工具',
        },
      },
      {
        path: 'logo',
        name: 'logo',
        component: () => import('@/views/logo/index.vue'),
        meta: {
          title: 'Logo 编辑器',
          icon: 'i-lucide-image',
          description: 'SVG Logo 实时编辑和预览',
        },
      },
      {
        path: 'mock',
        name: 'mock',
        component: () => import('@/views/mock.vue'),
        meta: {
          title: 'Mock API 示例',
          icon: 'i-lucide-database',
          description: 'Mock API 调用演示',
        },
      },
      layoutShowcaseRoute,
    ],
  },
]
