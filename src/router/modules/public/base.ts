import type { LayoutRouteModule } from '@/components/layouts'

/** 公共路由：放在布局壳外，适合错误页、独立落地页或后续扩展页面。 */
export const publicRoutes: LayoutRouteModule = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: '页面不存在',
      layout: 'blank',
      hidden: true,
    },
  },
]
