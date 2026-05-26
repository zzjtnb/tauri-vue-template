import type { LayoutRouteModule } from '@tauri-vue-template/ui'
import { LayoutRuntime } from '@tauri-vue-template/ui'

/** 模板路由；选择页是模板模块入口，具体模板必须作为它下面的 child route 维护。 */
export const pageRoutes: LayoutRouteModule = [
  {
    path: '',
    name: 'home',
    components: LayoutRuntime.defineContent(() => import('@/views/home/index.vue')),
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
    path: 'topnav',
    name: 'topnav',
    components: LayoutRuntime.defineContent(() => import('@/views/topnav/index.vue')),
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
    path: 'sidebar',
    name: 'sidebar',
    components: LayoutRuntime.defineContent(() => import('@/views/sidebar/index.vue')),
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
    path: 'hybrid',
    name: 'hybrid',
    components: LayoutRuntime.defineContent(() => import('@/views/hybrid/index.vue')),
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
    path: 'blank',
    name: 'blank',
    components: LayoutRuntime.defineContent(() => import('@/views/blank/index.vue')),
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
    path: 'workspace',
    name: 'workspace',
    components: LayoutRuntime.defineContent(() => import('@/views/workspace/index.vue')),
    meta: {
      title: '智能工作台模板',
      icon: 'i-lucide-bot',
      order: 115,
      layout: {
        name: 'hybrid',
        settings: true,
        fixed: true,
        header: {
          brand: { component: () => import('@/views/workspace/layout/Brand.vue') },
          center: false,
        },
        sidebar: {
          all: { component: () => import('@/views/workspace/layout/Sidebar.vue') },
        },
        footer: false,
        content: {
          label: '智能工作台模板内容',
          class: 'overflow-hidden',
        },
      },
    },
  },
]
