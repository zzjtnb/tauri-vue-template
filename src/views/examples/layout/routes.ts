import type { Layout } from '@/components/layouts'
import { LayoutRuntime } from '@/components/layouts'

export const layoutShowcaseRoute = {
  path: 'layout',
  redirect: { name: 'examples-layout' },
  meta: {
    title: '布局系统演示',
    icon: 'i-lucide-layout-dashboard',
    order: 910,
    breadcrumb: true,
    alwaysShow: true,
    layout: 'hybrid',
  },
  children: [
    {
      path: '',
      name: 'examples-layout',
      component: () => import('@/views/examples/layout/index.vue'),
      meta: {
        title: '布局能力总览',
        icon: 'i-lucide-layout-dashboard',
        order: 911,
        breadcrumb: true,
        layout: 'hybrid',
      },
    },
    {
      path: 'standard',
      name: 'examples-layout-standard',
      redirect: { name: 'examples-layout-topnav' },
      meta: {
        title: '标准布局模式',
        icon: 'i-lucide-panel-top',
        order: 920,
        breadcrumb: true,
        alwaysShow: true,
        layout: 'hybrid',
      },
      children: [
        {
          path: 'topnav',
          name: 'examples-layout-topnav',
          component: () => import('@/views/examples/layout/StandardModes.vue'),
          meta: {
            title: 'Topnav 顶部导航',
            icon: 'i-lucide-panel-top',
            order: 921,
            breadcrumb: true,
            layout: {
              name: 'topnav',
              footer: {
                component: () => import('@/views/examples/layout/components/FooterStatus.vue'),
                label: '演示底部栏',
              },
            },
          },
        },
        {
          path: 'sidebar',
          name: 'examples-layout-sidebar',
          component: () => import('@/views/examples/layout/StandardModes.vue'),
          meta: {
            title: 'Sidebar 侧边导航',
            icon: 'i-lucide-panel-left',
            order: 922,
            breadcrumb: true,
            layout: {
              name: 'sidebar',
              footer: {
                component: () => import('@/views/examples/layout/components/FooterStatus.vue'),
                label: '演示底部栏',
              },
            },
          },
        },
        {
          path: 'hybrid',
          name: 'examples-layout-hybrid',
          component: () => import('@/views/examples/layout/StandardModes.vue'),
          meta: {
            title: 'Hybrid 混合导航',
            icon: 'i-lucide-panels-top-left',
            order: 923,
            breadcrumb: true,
            layout: {
              name: 'hybrid',
              footer: {
                component: () => import('@/views/examples/layout/components/FooterStatus.vue'),
                label: '演示底部栏',
              },
            },
          },
        },
        {
          path: 'blank',
          name: 'examples-layout-blank',
          component: () => import('@/views/examples/layout/StandardModes.vue'),
          meta: {
            title: 'Blank 空白布局',
            icon: 'i-lucide-square',
            order: 924,
            breadcrumb: false,
            layout: 'blank',
          },
        },
      ],
    },
    {
      path: 'regions',
      name: 'examples-layout-regions',
      redirect: { name: 'examples-layout-areas' },
      meta: {
        title: '区域扩展机制',
        icon: 'i-lucide-panels-top-left',
        order: 930,
        breadcrumb: true,
        alwaysShow: true,
        layout: 'hybrid',
      },
      children: [
        {
          path: 'areas',
          name: 'examples-layout-areas',
          component: () => import('@/views/examples/layout/AreaOverrides.vue'),
          meta: {
            title: '区域对象与预设',
            icon: 'i-lucide-panels-top-left',
            order: 931,
            breadcrumb: true,
            layout: {
              name: 'hybrid',
              header: {
                mode: 'auto',
                label: '演示顶部栏',
                class: 'bg-background/95',
                brand: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/HeaderBrand.vue'),
                  label: '演示顶部栏品牌区',
                  class: 'min-w-0',
                },
                right: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/HeaderActions.vue'),
                  label: '演示顶部栏操作区',
                  class: 'min-w-0',
                },
                center: {
                  mode: 'default',
                  label: '路由覆盖顶部栏导航区',
                  class: 'justify-center',
                  addons: {
                    before: {
                      component: () => import('@/views/examples/layout/components/AreaAddon.vue'),
                      props: { label: 'header.center addon', icon: 'i-lucide-plus' },
                    },
                  },
                },
              },
              sidebar: {
                mode: 'auto',
                label: '演示侧边栏',
                class: 'bg-sidebar',
                header: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarPanel.vue'),
                  label: '演示侧边栏头部',
                },
                content: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarNavigation.vue'),
                  label: '演示侧边栏内容',
                  class: 'bg-sidebar/80',
                },
                footer: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarFootnote.vue'),
                  label: '演示侧边栏底部',
                },
              },
              content: {
                mode: 'auto',
                label: '区域对象演示内容',
                class: 'bg-muted/20',
                before: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/ContentStrip.vue'),
                  label: '演示内容前置区',
                },
                after: {
                  component: () => import('@/views/examples/layout/components/ContentStrip.vue'),
                  label: '演示内容后置区',
                },
              },
              footer: {
                mode: 'auto',
                label: '演示底部栏',
                class: 'bg-card/60',
                left: {
                  component: () => import('@/views/examples/layout/components/FooterStatus.vue'),
                  label: '演示底部栏左区',
                },
                center: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/AreaAddon.vue'),
                  label: '演示底部栏中区',
                  class: 'justify-center',
                },
                right: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/AreaAddon.vue'),
                  label: '路由覆盖底部栏右区',
                  class: 'justify-end',
                  addons: {
                    after: {
                      component: () => import('@/views/examples/layout/components/AreaAddon.vue'),
                      props: { label: 'footer.right addon', icon: 'i-lucide-sparkles' },
                    },
                  },
                },
              },
            },
          },
        },
        {
          path: 'whole-header',
          name: 'examples-layout-whole-header',
          component: () => import('@/views/examples/layout/AreaOverrides.vue'),
          meta: {
            title: '整区 Header 覆盖',
            icon: 'i-lucide-app-window',
            order: 932,
            breadcrumb: true,
            hidden: true,
            layout: {
              name: 'hybrid',
              header: {
                component: () => import('@/views/examples/layout/components/FullHeader.vue'),
                label: '整区 Header 覆盖',
              },
              sidebar: {
                all: { component: () => import('@/views/examples/layout/components/SidebarNavigation.vue') },
                header: { component: () => import('@/views/examples/layout/components/SidebarPanel.vue') },
                footer: { component: () => import('@/views/examples/layout/components/SidebarFootnote.vue') },
              },
              footer: {
                component: () => import('@/views/examples/layout/components/FullFooter.vue'),
                label: '整区 Footer 覆盖',
              },
            },
          },
        },
        {
          path: 'components',
          name: 'examples-layout-components',
          component: () => import('@/views/examples/layout/AreaOverrides.vue'),
          meta: {
            title: '整区组件配置',
            icon: 'i-lucide-zap',
            order: 933,
            breadcrumb: true,
            hidden: true,
            layout: {
              name: 'hybrid',
              header: {
                component: () => import('@/views/examples/layout/components/FullHeader.vue'),
                label: '显式 Header 组件',
              },
              sidebar: {
                component: () => import('@/views/examples/layout/components/SidebarNavigation.vue'),
                label: '显式 Sidebar 组件',
              },
              content: {
                component: () => import('@/views/examples/layout/components/RegionCard.vue'),
                label: '显式 Content 组件',
              },
              footer: {
                component: () => import('@/views/examples/layout/components/FullFooter.vue'),
                label: '显式 Footer 组件',
              },
            },
          },
        },
        {
          path: 'all-parts',
          name: 'examples-layout-all-parts',
          component: () => import('@/views/examples/layout/AreaOverrides.vue'),
          meta: {
            title: 'all 批量子区',
            icon: 'i-lucide-copy-check',
            order: 934,
            breadcrumb: true,
            hidden: true,
            layout: {
              name: 'hybrid',
              settings: false,
              header: {
                all: { component: () => import('@/views/examples/layout/components/RegionCard.vue') },
                right: { component: () => import('@/views/examples/layout/components/HeaderActions.vue') },
              },
              sidebar: {
                all: { component: () => import('@/views/examples/layout/components/SidebarPanel.vue') },
                content: { component: () => import('@/views/examples/layout/components/SidebarNavigation.vue') },
              },
              content: {
                all: { component: () => import('@/views/examples/layout/components/ContentStrip.vue') },
              },
              footer: {
                all: { component: () => import('@/views/examples/layout/components/AreaAddon.vue') },
                left: { component: () => import('@/views/examples/layout/components/FooterStatus.vue') },
              },
            },
          },
        },
        {
          path: 'no-settings',
          name: 'examples-layout-no-settings',
          component: () => import('@/views/examples/layout/AreaOverrides.vue'),
          meta: {
            title: '关闭默认设置入口',
            icon: 'i-lucide-settings-off',
            order: 936,
            breadcrumb: true,
            hidden: true,
            layout: {
              name: 'hybrid',
              settings: false,
              footer: {
                component: () => import('@/views/examples/layout/components/FooterStatus.vue'),
                label: '演示底部栏',
              },
            },
          },
        },
        {
          path: 'named-views',
          name: 'examples-layout-named-views',
          components: {
            'default': () => import('@/views/examples/layout/NamedViews.vue'),
            'layout-header-left': () => import('@/views/examples/layout/components/RegionCard.vue'),
            'layout-header-brand': () => import('@/views/examples/layout/components/HeaderBrand.vue'),
            'layout-header-center': () => import('@/views/examples/layout/components/RegionCard.vue'),
            'layout-header-right': () => import('@/views/examples/layout/components/HeaderActions.vue'),
            'layout-sidebar-header': () => import('@/views/examples/layout/components/SidebarPanel.vue'),
            'layout-sidebar-content': () => import('@/views/examples/layout/components/SidebarNavigation.vue'),
            'layout-sidebar-footer': () => import('@/views/examples/layout/components/SidebarFootnote.vue'),
            'layout-content-before': () => import('@/views/examples/layout/components/ContentStrip.vue'),
            'layout-content-after': () => import('@/views/examples/layout/components/RegionCard.vue'),
            'layout-footer-left': () => import('@/views/examples/layout/components/FooterStatus.vue'),
            'layout-footer-center': () => import('@/views/examples/layout/components/AreaAddon.vue'),
            'layout-footer-right': () => import('@/views/examples/layout/components/RegionCard.vue'),
          },
          meta: {
            title: '命名视图覆盖',
            icon: 'i-lucide-route',
            order: 934,
            breadcrumb: true,
            layout: 'hybrid',
          },
        },
        {
          path: 'slots',
          name: 'examples-layout-slots',
          component: () => import('@/views/examples/layout/SlotHost.vue'),
          meta: {
            title: '显式 Slots 宿主',
            icon: 'i-lucide-layout-template',
            order: 935,
            breadcrumb: true,
            layout: {
              name: 'hybrid',
              header: {
                mode: 'auto',
                label: '演示顶部栏',
                class: 'bg-background/95',
                brand: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/HeaderBrand.vue'),
                  label: '演示顶部栏品牌区',
                  class: 'min-w-0',
                },
                right: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/HeaderActions.vue'),
                  label: '演示顶部栏操作区',
                  class: 'min-w-0',
                },
              },
              sidebar: {
                mode: 'auto',
                label: '演示侧边栏',
                class: 'bg-sidebar',
                header: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarPanel.vue'),
                  label: '演示侧边栏头部',
                },
                content: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarNavigation.vue'),
                  label: '演示侧边栏内容',
                  class: 'bg-sidebar/80',
                },
                footer: {
                  mode: 'auto',
                  component: () => import('@/views/examples/layout/components/SidebarFootnote.vue'),
                  label: '演示侧边栏底部',
                },
              },
              content: {
                before: {
                  component: () => import('@/views/examples/layout/components/ContentStrip.vue'),
                  label: '显式 slot 示例前置区',
                },
              },
            },
          },
        },
      ],
    },
    {
      path: 'content',
      name: 'examples-layout-content',
      redirect: { name: 'examples-layout-outlet' },
      meta: {
        title: '内容出口能力',
        icon: 'i-lucide-square-dashed-mouse-pointer',
        order: 950,
        breadcrumb: true,
        alwaysShow: true,
        layout: 'hybrid',
      },
      children: [
        {
          path: 'outlet',
          name: 'examples-layout-outlet',
          components: LayoutRuntime.defineContent(() => import('@/views/examples/layout/OutletControl.vue')),
          meta: {
            title: '整页接管内容区',
            icon: 'i-lucide-square-dashed-mouse-pointer',
            order: 951,
            breadcrumb: true,
            layout: 'hybrid',
          },
        },
        {
          path: 'iframe',
          redirect: { name: 'examples-layout-iframe' },
          meta: {
            title: 'iframe 内容出口',
            icon: 'i-lucide-panels-right-bottom',
            order: 960,
            breadcrumb: true,
            alwaysShow: true,
            layout: 'hybrid',
          },
          children: [
            {
              path: 'overview',
              name: 'examples-layout-iframe',
              component: () => import('@/views/examples/layout/IframeOutlet.vue'),
              meta: {
                title: 'iframe 内容出口说明',
                icon: 'i-lucide-panels-right-bottom',
                order: 961,
                breadcrumb: true,
              },
            },
            {
              path: 'local',
              name: 'examples-layout-iframe-local',
              component: () => import('@/views/examples/layout/IframeOutlet.vue'),
              meta: {
                title: 'iframe 本地内嵌',
                icon: 'i-lucide-file-text',
                order: 962,
                breadcrumb: true,
                iframeSrc: '/examples/layout/content/iframe/frame',
                iframeSandbox: 'allow-scripts allow-same-origin',
                iframeReferrerPolicy: 'strict-origin-when-cross-origin',
                iframeAllow: 'fullscreen',
              },
            },
            {
              path: 'external',
              name: 'examples-layout-iframe-external',
              component: () => import('@/views/examples/layout/IframeOutlet.vue'),
              meta: {
                title: 'iframe 外部地图',
                icon: 'i-lucide-globe-2',
                order: 963,
                breadcrumb: true,
                iframeSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=116.2%2C39.75%2C116.55%2C40.05&layer=mapnik',
                iframeSandbox: 'allow-scripts allow-forms allow-popups',
                iframeReferrerPolicy: 'strict-origin-when-cross-origin',
                iframeAllow: 'fullscreen; geolocation',
              },
            },
            {
              path: 'frame',
              name: 'examples-layout-frame',
              component: () => import('@/views/examples/layout/FrameDocument.vue'),
              meta: {
                title: 'iframe 被嵌入文档',
                hidden: true,
                layout: 'blank',
              },
            },
          ],
        },
      ],
    },
    {
      path: 'state',
      name: 'examples-layout-state',
      redirect: { name: 'examples-layout-cache' },
      meta: {
        title: '状态与导航',
        icon: 'i-lucide-history',
        order: 970,
        breadcrumb: true,
        alwaysShow: true,
        layout: 'hybrid',
      },
      children: [
        {
          path: 'cache/:id?',
          name: 'examples-layout-cache',
          component: () => import('@/views/examples/layout/CacheState.vue'),
          meta: {
            title: '页签与 KeepAlive',
            icon: 'i-lucide-history',
            order: 971,
            breadcrumb: true,
            keepAlive: true,
            cacheKey: 'examples-layout-cache',
            layout: 'hybrid',
          },
        },
        {
          path: 'external-docs',
          name: 'examples-layout-external-docs',
          component: () => import('@/views/examples/layout/index.vue'),
          meta: {
            title: '外链菜单项',
            icon: 'i-lucide-external-link',
            order: 972,
            externalLink: 'https://router.vuejs.org/',
            menuTarget: '_blank',
            layout: 'hybrid',
          },
        },
      ],
    },
  ],
} satisfies Layout['Route']['RecordRaw']
