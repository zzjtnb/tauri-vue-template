<script setup lang="ts">
import type { RenderContext } from '../../types/internal'
import type { Layout } from '../../types/public'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { affixItems, breadcrumbs, navPath, routeNavPath } from '../../utils/menu'

const props = defineProps<{
  runtime: RenderContext
}>()

const route = useRoute()
const router = useRouter()
const activePath = computed(() => routeNavPath(route))
const breadcrumbItems = computed(() => breadcrumbs({
  currentRoute: route,
  fallbackTitle: `${route.meta.title ?? ''}`,
}))
const affixTabs = computed(() => affixItems({
  routes: props.runtime.routes,
  currentPath: activePath.value,
}))
const visitedTabs = computed(() => props.runtime.tabs?.visibleViews.value ?? [])
const affixPathSet = computed(() => new Set(affixTabs.value.map(item => item.path)))
// 固定页签永远显示在前面；已访问页签如果命中固定页签路径，只保留固定项，避免重复标签。
const uniqueVisitedTabs = computed(() => visitedTabs.value.filter(item => !affixPathSet.value.has(navPath(item.path))))
const shouldShowBreadcrumb = computed(() => props.runtime.elements.breadcrumb && breadcrumbItems.value.length > 1)
const shouldShowTabs = computed(() => props.runtime.elements.tabs && (affixTabs.value.length > 0 || uniqueVisitedTabs.value.length > 0))
const hasVisitedActions = computed(() => Boolean(props.runtime.tabs) && uniqueVisitedTabs.value.length > 0)
const currentVisitedTab = computed(() => uniqueVisitedTabs.value.find(isVisitedActive))
const tabActions = computed(() => [
  { key: 'other', label: '关闭其他', disabled: !currentVisitedTab.value, action: closeOtherTabs },
  { key: 'left', label: '关闭左侧', disabled: !currentVisitedTab.value, action: closeLeftTabs },
  { key: 'right', label: '关闭右侧', disabled: !currentVisitedTab.value, action: closeRightTabs },
  { key: 'all', label: '关闭全部', disabled: false, action: closeAllTabs },
])

function isVisitedActive(tab: Layout['Tabs']['Visited']): boolean {
  return route.fullPath === tab.fullPath || route.path === tab.path
}

function tabLinkClass(active: boolean) {
  return [
    'text-xs px-3 py-1.5 border rounded-full transition inline-flex gap-1.5 items-center max-w-52',
    active
      ? 'border-primary bg-primary/5 text-foreground hover:border-primary hover:bg-primary/5'
      : 'text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5',
  ]
}

// 关闭当前页签后优先退回最后一个可见页签；没有已访问页签时退回第一个固定页签或首页。
function nextFallbackPath(closedTab: Layout['Tabs']['Visited']): string {
  const candidates = [...affixTabs.value.map(item => ({ path: item.path })), ...uniqueVisitedTabs.value]
    .filter(item => item.path !== closedTab.path)
  const last = candidates.at(-1)
  return 'fullPath' in (last ?? {}) ? (last as Layout['Tabs']['Visited']).fullPath : last?.path ?? '/'
}

async function closeTab(tab: Layout['Tabs']['Visited']): Promise<void> {
  const active = isVisitedActive(tab)
  props.runtime.tabs?.delView(tab)

  if (active) {
    await router.push(nextFallbackPath(tab))
  }
}

function closeOtherTabs(): void {
  if (currentVisitedTab.value) {
    props.runtime.tabs?.delOtherViews(currentVisitedTab.value)
  }
}

function closeLeftTabs(): void {
  if (currentVisitedTab.value) {
    props.runtime.tabs?.delLeftViews(currentVisitedTab.value)
  }
}

function closeRightTabs(): void {
  if (currentVisitedTab.value) {
    props.runtime.tabs?.delRightViews(currentVisitedTab.value)
  }
}

async function closeAllTabs(): Promise<void> {
  props.runtime.tabs?.delAllViews()
  const fallback = affixTabs.value[0]?.path ?? '/'
  if (!affixPathSet.value.has(activePath.value)) {
    await router.push(fallback)
  }
}
</script>

<template>
  <template v-if="shouldShowBreadcrumb || shouldShowTabs">
    <div v-if="shouldShowBreadcrumb" aria-label="面包屑栏容器" class="px-4 py-3 border-b border-border">
      <nav aria-label="面包屑" class="text-sm text-muted-foreground flex gap-2 min-w-0 items-center">
        <template v-for="(item, index) in breadcrumbItems" :key="`${item.path}:${index}`">
          <RouterLink
            v-if="index < breadcrumbItems.length - 1"
            :to="item.path"
            class="text-muted-foreground truncate hover:text-foreground"
            :aria-label="`前往${item.title}`"
          >
            {{ item.title }}
          </RouterLink>
          <span v-else class="text-foreground font-semibold truncate" aria-current="page">
            {{ item.title }}
          </span>
          <span v-if="index < breadcrumbItems.length - 1" class="text-border" aria-hidden="true">/</span>
        </template>
      </nav>
    </div>

    <div v-if="shouldShowTabs" aria-label="布局页签栏" class="px-4 py-2 border-b border-border flex gap-2 min-w-0 items-center justify-between">
      <nav aria-label="页面页签" class="flex flex-1 flex-wrap gap-2 min-w-0">
        <RouterLink
          v-for="item in affixTabs"
          :key="`affix:${item.name}`"
          :to="item.path"
          :class="tabLinkClass(activePath === item.path)"
          :aria-current="activePath === item.path ? 'page' : undefined"
          :aria-label="`打开固定页签${item.title}`"
        >
          <span class="i-lucide-pin size-3" aria-hidden="true" />
          <span class="truncate">{{ item.title }}</span>
        </RouterLink>

        <span
          v-for="item in uniqueVisitedTabs"
          :key="`visited:${item.fullPath}`"
          :class="tabLinkClass(isVisitedActive(item))"
        >
          <RouterLink :to="item.fullPath" class="min-w-0 truncate" :aria-current="isVisitedActive(item) ? 'page' : undefined" :aria-label="`打开页签${item.title}`">
            {{ item.title }}
          </RouterLink>
          <button type="button" class="p-0.5 rounded-full hover:bg-muted" :aria-label="`关闭${item.title}`" @click="closeTab(item)">
            <span class="i-lucide-x size-3" aria-hidden="true" />
          </button>
        </span>
      </nav>

      <div v-if="hasVisitedActions" aria-label="页签操作" class="flex shrink-0 gap-1 max-md:hidden">
        <button
          v-for="action in tabActions"
          :key="action.key"
          type="button"
          class="text-xs text-muted-foreground px-2 py-1 rounded-md hover:text-foreground hover:bg-accent"
          :disabled="action.disabled"
          :aria-label="action.label"
          @click="action.action()"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </template>
</template>
