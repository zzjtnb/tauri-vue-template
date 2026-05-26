<script setup lang="ts">
import type { Activity } from '../types'
import { Button } from '@tauri-vue-template/ui'
import { useClipboard } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  activity: Activity
}>()

const { copy, copied } = useClipboard()
const fromUser = computed(() => props.activity.source === 'user')
const entryClass = computed(() => [
  'group relative mb-6 flex gap-3',
  fromUser.value ? 'justify-end' : 'justify-start',
])
const contentClass = computed(() => [
  'min-w-0 break-words text-[0.95rem] leading-7 shadow-sm rounded-[1.65rem] px-4 py-3',
  fromUser.value
    ? 'w-fit border border-primary/20 bg-primary/10'
    : 'w-full border border-border/70 bg-card/85 backdrop-blur',
])
const actionsClass = computed(() => [
  'pointer-events-none absolute z-[1] top-[calc(100%+0.35rem)] left-0 flex -translate-y-1 gap-1.5 opacity-0 transition-[opacity,transform] duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100',
  fromUser.value && 'right-0 left-auto justify-end',
])

function copyActivity(): void {
  void copy(`${props.activity.title}\n${props.activity.description}`)
}
</script>

<template>
  <article :class="entryClass">
    <div v-if="!fromUser" class="text-primary mt-1 border border-border/70 rounded-2xl bg-card/80 shrink-0 grid size-9 shadow-sm place-items-center backdrop-blur max-md:hidden" aria-hidden="true">
      <span class="i-lucide-sparkles size-4" />
    </div>

    <div class="gap-2 grid min-w-0 relative" :class="fromUser ? 'max-w-[min(34rem,100%)] justify-items-end' : 'flex-1 max-w-[min(52rem,100%)]'">
      <div :class="contentClass">
        <p class="text-sm font-bold m-0">
          {{ activity.title }}
        </p>
        <p class="text-muted-foreground m-0 mt-1">
          {{ activity.description }}
        </p>
      </div>

      <div :class="actionsClass">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="text-muted-foreground border border-border/80 rounded-xl bg-card/90 size-8 shadow-sm transition backdrop-blur hover:text-foreground hover:bg-accent"
          title="复制活动内容"
          @click="copyActivity"
        >
          <span v-if="copied" class="i-lucide-check text-primary size-4" aria-hidden="true" />
          <span v-else class="i-lucide-copy size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </article>
</template>
