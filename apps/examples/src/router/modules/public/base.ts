import type { LayoutRouteModule } from '@tauri-vue-template/ui'

/**
 * 公共路由：放在布局壳外，适合错误页或后续扩展示例落地页。
 *
 * 404 页面不属于具体演示分组，因此不放到 / children 中；
 * layout: 'blank' 可以避免错误页再渲染示例导航，确保未知路径的反馈足够直接。
 */
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
