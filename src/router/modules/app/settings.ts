import type { LayoutRouteModule } from '@/components/layouts'
import { LayoutRuntime } from '@/components/layouts'

/** 设置路由；整页接管内容区，避免默认页面 padding 和主内容包裹影响设置面板密度。 */
export const settingsRoutes: LayoutRouteModule = [
  {
    path: 'settings',
    name: 'settings',
    components: LayoutRuntime.defineContent(() => import('@/views/settings/index.vue')),
    meta: {
      title: '设置',
      icon: 'i-lucide-settings',
      order: 400,
      hidden: true,
      layout: {
        name: 'topnav',
        settings: false,
      },
    },
  },
]
