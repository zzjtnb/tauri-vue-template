import type { RouteMeta } from 'vue-router'

interface InternalAppRouteMeta extends RouteMeta {
  // 浏览器标题；布局展示字段由 layouts 自己读取。
  title?: string
}

/** 应用路由类型根对象；模板不内置鉴权、角色或权限规则。 */
export interface AppRoute {
  // 应用路由 meta；业务项目需要权限字段时在这里扩展。
  Meta: InternalAppRouteMeta
}
