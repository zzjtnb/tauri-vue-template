<script setup lang="ts">
import type { Layout } from '@/components/layouts/types/public'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { isMenuActive } from '@/components/layouts/utils/menu'

type Surface = 'default' | 'sidebar'

defineOptions({
  name: 'NavigationMenu',
})

const props = withDefaults(defineProps<{
  items: Layout['Menu']['Item'][]
  activePath: string
  label?: string
  variant?: 'horizontal' | 'vertical'
  collapsed?: boolean
  menuMode?: Layout['Menu']['Mode']
  surface?: Surface
  nested?: boolean
}>(), {
  label: '导航菜单',
  variant: 'vertical',
  collapsed: false,
  menuMode: 'collapse',
  surface: 'default',
  nested: false,
})

const emit = defineEmits<{
  select: [item: Layout['Menu']['Item']]
}>()

const menuRef = useTemplateRef<HTMLElement>('menu')
// openOverrides 只记录用户手动展开/收起过的分组；未记录的分组继续由 menuMode 和当前激活路由自动推导。
// 这样切换路由时可以自动展开当前路径，同时又不会覆盖用户刚刚手动操作的分组。
const openOverrides = shallowRef(new Map<string, boolean>())
// 顶部导航的浮层一次只打开一个，避免多个 popover 同时存在导致键盘焦点和点击外部关闭逻辑混乱。
const topOpen = shallowRef<string>()
const rail = computed(() => props.collapsed && props.variant === 'vertical')
// 先把当前路由命中的菜单 name 收集成 Set，模板中多次判断 active 时就不需要反复递归整棵菜单树。
const activeNames = computed(() => {
  const names = new Set<string>()

  function collect(item: Layout['Menu']['Item']): boolean {
    const active = isMenuActive(item, props.activePath)
    if (active) {
      names.add(item.name)
    }
    item.children?.forEach(collect)
    return active
  }

  props.items.forEach(collect)
  return names
})

function isActive(item: Layout['Menu']['Item']): boolean {
  return activeNames.value.has(item.name)
}

function itemClass(active: boolean, surface: Surface = props.surface, collapsed = rail.value) {
  return [
    'text-sm px-3 py-2 rounded-lg flex gap-2 transition items-center min-w-0',
    collapsed && 'justify-center px-2',
    active
      ? 'bg-primary text-primary-foreground hover:bg-primary'
      : surface === 'sidebar' ? 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
  ]
}

// 垂直菜单分组打开规则：用户手动操作优先，其次 expand 模式默认打开，再其次当前激活路径自动打开。
function isOpen(item: Layout['Menu']['Item']): boolean {
  const override = openOverrides.value.get(item.name)
  return override ?? (!props.nested && (props.menuMode === 'expand' || isActive(item)))
}

function toggleOpen(item: Layout['Menu']['Item']): void {
  const nextOverrides = new Map(openOverrides.value)
  nextOverrides.set(item.name, !isOpen(item))
  openOverrides.value = nextOverrides
}

function isTopOpen(item: Layout['Menu']['Item']): boolean {
  return topOpen.value === item.name
}

function toggleTop(item: Layout['Menu']['Item']): void {
  topOpen.value = isTopOpen(item) ? undefined : item.name
}

function closeTop(): void {
  topOpen.value = undefined
}

function selectTop(item: Layout['Menu']['Item']): void {
  closeTop()
  emit('select', item)
}

function linkComponent(item: Layout['Menu']['Item']) {
  return item.externalLink || item.menuTarget === '_blank' ? 'a' : RouterLink
}

function linkAttrs(item: Layout['Menu']['Item']) {
  if (item.externalLink || item.menuTarget === '_blank') {
    return {
      href: item.externalLink || item.path,
      target: item.menuTarget === '_blank' ? '_blank' : undefined,
      rel: 'noopener noreferrer',
    }
  }

  return { to: item.path }
}

function onDocPointer(event: PointerEvent): void {
  if (!menuRef.value || menuRef.value.contains(event.target as Node)) {
    return
  }
  closeTop()
}

function onDocKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeTop()
  }
}

// 只有 horizontal 顶部菜单需要监听 document：点击外部或按 Esc 时关闭浮层；vertical 菜单不注册全局监听。
watch(() => props.variant, (variant, _oldVariant, onCleanup) => {
  if (variant !== 'horizontal' || typeof document === 'undefined') {
    return
  }

  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onDocKey)
  onCleanup(() => {
    document.removeEventListener('pointerdown', onDocPointer)
    document.removeEventListener('keydown', onDocKey)
  })
}, { immediate: true })

watch(() => props.menuMode, () => {
  if (openOverrides.value.size > 0) {
    openOverrides.value = new Map()
  }
  closeTop()
})

// 路由树变化后清理已经不存在的手动展开记录，避免远程路由/权限刷新后保留无效分组状态。
watch(() => [props.activePath, props.items] as const, () => {
  if (openOverrides.value.size > 0) {
    const itemNames = new Set(props.items.map(item => item.name))
    const kept = [...openOverrides.value].filter(([name, open]) => open && itemNames.has(name))
    if (kept.length !== openOverrides.value.size) {
      openOverrides.value = new Map(kept)
    }
  }
  closeTop()
})
</script>

<template>
  <nav
    ref="menu"
    :aria-label="label"
    :class="[
      variant === 'horizontal' ? 'max-md:hidden flex gap-1 min-w-0 items-center justify-center' : 'gap-2 grid',
      variant === 'vertical' && (collapsed ? 'p-2' : 'p-3'),
      variant === 'vertical' && nested && !collapsed && ['ml-3 pl-2 border-l', surface === 'sidebar' ? 'border-sidebar-border' : 'border-border'],
    ]"
  >
    <template v-for="item in items" :key="item.name">
      <div v-if="variant === 'horizontal' && item.children?.length" :aria-label="`${item.title} 顶部菜单容器`" class="relative">
        <button
          :id="`layout-menu-${item.name}`"
          type="button"
          :class="itemClass(isActive(item), 'default', false)"
          :aria-label="`${isTopOpen(item) ? '收起' : '展开'}${item.title} 顶部菜单`"
          aria-haspopup="menu"
          :aria-controls="`layout-menu-panel-${item.name}`"
          :aria-expanded="isTopOpen(item)"
          @click="toggleTop(item)"
        >
          <span v-if="item.icon" class="shrink-0 size-4" :class="item.icon" aria-hidden="true" />
          <span class="truncate">{{ item.title }}</span>
          <span class="i-lucide-chevron-down shrink-0 size-3.5 transition" :class="isTopOpen(item) && 'rotate-180'" aria-hidden="true" />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-1 opacity-0"
        >
          <div
            v-if="isTopOpen(item)"
            :id="`layout-menu-panel-${item.name}`"
            :aria-label="`${item.title} 顶部菜单面板`"
            :aria-labelledby="`layout-menu-${item.name}`"
            class="text-popover-foreground mt-2 p-2 border border-border rounded-xl bg-popover min-w-52 shadow-lg right-0 top-full absolute z-30"
          >
            <NavigationMenu :items="item.children" :active-path="activePath" :menu-mode="menuMode" variant="vertical" @select="selectTop" />
          </div>
        </Transition>
      </div>

      <section v-else-if="item.children?.length" :aria-label="`${item.title} 子菜单分组`" class="gap-1 grid">
        <button
          type="button"
          class="w-full"
          :class="itemClass(isActive(item))"
          :aria-label="`${isOpen(item) ? '收起' : '展开'}${item.title} 子菜单`"
          :aria-expanded="isOpen(item)"
          :title="rail ? item.title : undefined"
          @click="toggleOpen(item)"
        >
          <span v-if="item.icon" class="shrink-0 size-4" :class="item.icon" aria-hidden="true" />
          <span :class="rail ? 'sr-only' : 'truncate'">{{ item.title }}</span>
          <span v-if="!rail" class="i-lucide-chevron-down ml-auto shrink-0 size-4 transition" :class="isOpen(item) && 'rotate-180'" aria-hidden="true" />
        </button>
        <NavigationMenu v-if="isOpen(item)" :items="item.children" :active-path="activePath" :label="`${item.title} 子菜单`" variant="vertical" :collapsed="collapsed" :menu-mode="menuMode" :surface="surface" nested @select="emit('select', $event)" />
      </section>

      <component
        :is="linkComponent(item)"
        v-else-if="item.externalLink || item.path"
        v-bind="linkAttrs(item)"
        :class="itemClass(isActive(item))"
        :title="rail ? item.title : undefined"
        :aria-label="`打开${item.title}`"
        @click="emit('select', item)"
      >
        <span v-if="item.icon" class="shrink-0 size-4" :class="item.icon" aria-hidden="true" />
        <span :class="rail ? 'sr-only' : 'truncate'">{{ item.title }}</span>
      </component>

      <span v-else class="text-sm px-3 py-2 rounded-lg flex gap-2 transition items-center" :class="[rail && 'justify-center px-2', surface === 'sidebar' ? 'text-sidebar-foreground/70' : 'text-muted-foreground']" :title="rail ? item.title : undefined">
        <span v-if="item.icon" class="shrink-0 size-4" :class="item.icon" aria-hidden="true" />
        <span :class="rail ? 'sr-only' : 'truncate'">{{ item.title }}</span>
      </span>
    </template>
  </nav>
</template>
