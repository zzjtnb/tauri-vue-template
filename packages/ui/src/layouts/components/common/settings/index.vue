<script setup lang="ts">
import type { Layout } from '../../../types/public'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import SettingsContent from './context/Content.vue'

const props = defineProps<{
  controls: Layout['Area']['Context']['settings']
  state: Layout['State']
}>()

const isOpen = computed(() => props.controls.open)
const panelRef = useTemplateRef<HTMLElement>('panel')
const closeButtonRef = useTemplateRef<HTMLButtonElement>('closeButton')
let previouslyFocusedElement: HTMLElement | undefined

function closeSettings(): void {
  props.controls.hide()
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeSettings()
    return
  }
  if (event.key !== 'Tab') {
    return
  }

  const items = panelRef.value
    ? [...panelRef.value.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter(item => !item.hasAttribute('disabled') && !item.getAttribute('aria-hidden'))
    : []
  const first = items[0]
  const last = items.at(-1)
  if (!first || !last) {
    event.preventDefault()
    return
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
    return
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// 设置面板是 Teleport 到 body 的对话框：打开时把焦点移到关闭按钮，关闭时恢复到触发前元素。
watch(isOpen, async (isOpen) => {
  if (isOpen) {
    previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    await nextTick()
    closeButtonRef.value?.focus()
    return
  }

  if (previouslyFocusedElement?.isConnected) {
    previouslyFocusedElement.focus()
  }
  previouslyFocusedElement = undefined
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" aria-label="设置面板遮罩" class="inset-0 fixed z-60">
        <button type="button" class="bg-foreground/20 inset-0 absolute" aria-label="关闭设置" @click="closeSettings" />
        <aside ref="panel" class="text-foreground bg-background flex flex-col w-[min(24rem,100vw)] shadow-2xl bottom-0 right-0 top-0 absolute" role="dialog" aria-modal="true" aria-label="设置" @keydown="onPanelKeydown">
          <header class="px-4 flex shrink-0 h-12 items-center justify-between" aria-label="设置面板顶部栏">
            <h2 class="text-base font-semibold m-0">
              设置
            </h2>
            <button ref="closeButton" type="button" class="text-muted-foreground p-2 rounded-lg transition hover:text-foreground hover:bg-accent" aria-label="关闭设置" @click="closeSettings">
              <span class="i-lucide-x size-4" aria-hidden="true" />
            </button>
          </header>

          <SettingsContent class="flex-1" :state="state" compact show-close @close="closeSettings" />
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
