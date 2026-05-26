<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/shadcn-vue/ui/sidebar'

const nav = [
  {
    title: '仪表盘',
    icon: 'i-lucide-layout-dashboard',
    badge: '12',
    active: true,
    action: true,
    children: [
      { title: '实时概览', active: true },
      { title: '趋势分析', active: false },
    ],
  },
  { title: '任务', icon: 'i-lucide-list-checks', badge: '4', active: false, action: true },
  { title: '文档', icon: 'i-lucide-file-text', active: false, action: false },
]

const sidebarOpen = shallowRef(true)
const loadingRows = Array.from({ length: 3 }, (_, index) => index)
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Sidebar 应用侧栏
    </h3>

    <SidebarProvider v-model:open="sidebarOpen" class="border rounded-xl bg-background min-h-[380px] overflow-hidden">
      <Sidebar collapsible="none" class="border-r w-72">
        <SidebarHeader>
          <SidebarInput placeholder="搜索工作区" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>主导航</SidebarGroupLabel>
            <SidebarGroupAction as="button" aria-label="新增导航">
              <span class="i-lucide-plus" aria-hidden="true" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in nav" :key="item.title">
                  <SidebarMenuButton :is-active="item.active" :tooltip="item.title">
                    <span :class="item.icon" aria-hidden="true" />
                    <span>{{ item.title }}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge v-if="item.badge">
                    {{ item.badge }}
                  </SidebarMenuBadge>
                  <SidebarMenuAction v-if="item.action" show-on-hover aria-label="更多操作">
                    <span class="i-lucide-more-horizontal" aria-hidden="true" />
                  </SidebarMenuAction>
                  <SidebarMenuSub v-if="item.children?.length">
                    <SidebarMenuSubItem v-for="child in item.children" :key="child.title">
                      <SidebarMenuSubButton href="#" :is-active="child.active">
                        <span>{{ child.title }}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>加载骨架</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="row in loadingRows" :key="row">
                  <SidebarMenuSkeleton show-icon />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" variant="outline">
                <span class="i-lucide-user-round" aria-hidden="true" />
                <span>演示账户</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset class="min-w-0">
        <header class="px-4 border-b flex gap-3 h-12 items-center">
          <SidebarTrigger />
          <div class="min-w-0">
            <p class="text-sm font-medium m-0">
              SidebarProvider + SidebarInset（{{ sidebarOpen ? '展开' : '折叠' }}）
            </p>
            <p class="text-xs text-muted-foreground m-0 truncate">
              示例使用 collapsible=&quot;none&quot;，避免在页面演示里产生全屏 fixed 侧栏。
            </p>
          </div>
        </header>
        <div class="p-4 gap-3 grid md:grid-cols-2">
          <div class="p-4 rounded-lg bg-muted/50">
            <p class="text-sm font-medium m-0">
              组合结构
            </p>
            <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
              Header、Content、Group、Menu、SubMenu、Badge、Action、Skeleton 和 Footer 都在同一侧栏中真实渲染。
            </p>
          </div>
          <div class="p-4 rounded-lg bg-muted/50">
            <p class="text-sm font-medium m-0">
              使用场景
            </p>
            <p class="text-sm text-muted-foreground leading-6 mb-0 mt-2">
              适合后台、工作台和工具型页面；完整应用可把 collapsible 改为 icon 或 offcanvas。
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
