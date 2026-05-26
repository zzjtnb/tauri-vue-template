<script setup lang="ts">
import type { Activity } from '../types'
import { nextTick, onMounted, shallowRef, watch } from 'vue'
import Welcome from '../welcome/index.vue'
import Entry from './Entry.vue'

const props = withDefaults(defineProps<{
  activities: Activity[]
  scrollToBottomVersion?: number
}>(), {
  scrollToBottomVersion: 0,
})

const emit = defineEmits<{
  start: [command: string]
}>()

const bodyRef = shallowRef<HTMLElement | null>(null)

async function scrollToBottom(): Promise<void> {
  await nextTick()
  const element = bodyRef.value
  if (!element) {
    return
  }

  element.scrollTop = element.scrollHeight
}

function startWorkspace(command: string): void {
  emit('start', command)
  void scrollToBottom()
}

watch(
  () => [props.activities.length, props.activities.at(-1)?.description, props.scrollToBottomVersion] as const,
  () => {
    void scrollToBottom()
  },
  { flush: 'post' },
)

onMounted(() => {
  void scrollToBottom()
})
</script>

<template>
  <div ref="bodyRef" class="px-3 pb-8 pt-7 min-h-0 overflow-x-hidden overflow-y-auto scroll-pb-28 md:px-6 md:pb-10 md:pt-9">
    <div class="mx-auto max-w-[54rem] min-w-0 w-full">
      <Welcome
        v-if="props.activities.length === 0"
        @start="startWorkspace"
      />
      <Entry
        v-for="activity in props.activities"
        v-else
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </div>
</template>
