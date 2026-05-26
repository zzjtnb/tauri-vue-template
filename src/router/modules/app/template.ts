import type { LayoutRouteModule } from '@/components/layouts'
import { RouterView } from 'vue-router'
import { LayoutRuntime } from '@/components/layouts'

/** 模板路由；选择页是模板模块入口，具体模板必须作为它下面的 child route 维护。 */
export const templateRoutes: LayoutRouteModule = [
  {
    path: '',
    name: 'template',
    component: RouterView,
    meta: {
      title: '模板',
      icon: 'i-lucide-layout-template',
      order: 100,
      alwaysShow: true,
    },
    children: [
      {
        path: '',
        name: 'template-selection',
        components: LayoutRuntime.defineContent(() => import('@/views/template/index.vue')),
        meta: {
          title: '模板选择',
          icon: 'i-lucide-layout-template',
          order: 100,
          affix: true,
          layout: {
            name: 'topnav',
          },
        },
      },
      {
        path: 'template/topnav',
        name: 'template-topnav',
        components: LayoutRuntime.defineContent(() => import('@/views/template/topnav/index.vue')),
        meta: {
          title: '顶部导航模板',
          icon: 'i-lucide-panels-top-left',
          order: 105,
          layout: {
            name: 'topnav',
          },
        },
      },
      {
        path: 'template/sidebar',
        name: 'template-sidebar',
        components: LayoutRuntime.defineContent(() => import('@/views/template/sidebar/index.vue')),
        meta: {
          title: '侧边栏布局模板',
          icon: 'i-lucide-panel-left',
          order: 108,
          layout: {
            name: 'sidebar',
          },
        },
      },
      {
        path: 'template/hybrid',
        name: 'template-hybrid',
        components: LayoutRuntime.defineContent(() => import('@/views/template/hybrid/index.vue')),
        meta: {
          title: '混合布局模板',
          icon: 'i-lucide-layout-dashboard',
          order: 109,
          layout: {
            name: 'hybrid',
          },
        },
      },
      {
        path: 'template/blank',
        name: 'template-blank',
        components: LayoutRuntime.defineContent(() => import('@/views/template/blank/index.vue')),
        meta: {
          title: '空白布局模板',
          icon: 'i-lucide-square',
          order: 112,
          layout: {
            name: 'blank',
            settings: false,
          },
        },
      },
      {
        path: 'template/workspace',
        name: 'template-workspace',
        components: LayoutRuntime.defineContent(() => import('@/views/template/workspace/index.vue')),
        meta: {
          title: '智能工作台模板',
          icon: 'i-lucide-bot',
          order: 115,
          layout: {
            name: 'hybrid',
            settings: true,
            fixed: true,
            header: {
              brand: { component: () => import('@/views/template/workspace/layout/Brand.vue') },
              center: false,
            },
            sidebar: {
              all: { component: () => import('@/views/template/workspace/layout/Sidebar.vue') },
            },
            footer: false,
            content: {
              label: '智能工作台模板内容',
              class: 'overflow-hidden',
            },
          },
        },
      },
    ],
  },
]
