import type { LayoutRouteModule } from '@/components/layouts'
import { RouterView } from 'vue-router'
import { layoutShowcaseRoute } from '@/views/examples/layout/routes'
import { shadcnShowcaseRoutes } from '@/views/examples/shadcn/routes'

/** 示例展示路由；统一承载字体、主题、组件和布局系统演示。 */
export const examplesRoutes: LayoutRouteModule = [
  {
    path: 'examples',
    name: 'examples',
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
        name: 'examples-overview',
        component: () => import('@/views/examples/index.vue'),
        meta: {
          title: '示例总览',
          icon: 'i-lucide-blocks',
          order: 901,
          description: '示例展示入口总览',
        },
      },
      {
        path: 'fonts',
        name: 'examples-fonts',
        component: () => import('@/views/examples/fonts.vue'),
        meta: {
          title: '字体系统',
          icon: 'i-lucide-type',
          description: '项目字体展示',
        },
      },
      {
        path: 'themes',
        name: 'examples-themes',
        component: () => import('@/views/examples/themes/index.vue'),
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
        name: 'examples-card',
        component: () => import('@/views/examples/card/index.vue'),
        meta: {
          title: '虚拟信用卡',
          icon: 'i-lucide-credit-card',
          description: '虚拟信用卡生成和验证工具',
        },
      },
      {
        path: 'logo',
        name: 'examples-logo',
        component: () => import('@/views/examples/logo/index.vue'),
        meta: {
          title: 'Logo 编辑器',
          icon: 'i-lucide-image',
          description: 'SVG Logo 实时编辑和预览',
        },
      },
      layoutShowcaseRoute,
    ],
  },
]
