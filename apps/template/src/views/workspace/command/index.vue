<script setup lang="ts">
import { Button, Textarea } from '@tauri-vue-template/ui'
import { computed, shallowRef } from 'vue'

const emit = defineEmits<{
  submit: []
}>()

const command = defineModel<string>({ required: true })

const toolsOpen = shallowRef(false)
const canSubmit = computed(() => Boolean(command.value.trim()))

function handleEnter(event: KeyboardEvent): void {
  if (event.isComposing) {
    return
  }

  event.preventDefault()
  if (canSubmit.value) {
    emit('submit')
  }
}

function toggleTools(): void {
  toolsOpen.value = !toolsOpen.value
}
</script>

<template>
  <section aria-label="工作台命令栏" class="mx-auto p-2 border border-border/80 rounded-[1.75rem] bg-card/90 max-w-5xl w-full shadow-lg transition backdrop-blur-xl focus-within:border-primary/35 focus-within:ring-4 focus-within:ring-primary/10">
    <Textarea
      v-model="command"
      class="text-[0.95rem] leading-6 px-3 py-2 border-0 rounded-[1.35rem] bg-transparent max-h-36 min-h-16 resize-none shadow-none focus-visible:ring-0"
      rows="1"
      placeholder="输入工作台命令，回车执行，Shift + Enter 换行"
      @keydown.enter.exact="handleEnter"
    />

    <div class="mt-1 flex flex-wrap gap-1 min-w-0 items-center">
      <Button type="button" variant="ghost" size="icon" class="text-muted-foreground rounded-full size-8 shadow-none transition hover:text-foreground hover:bg-accent" aria-label="展开工作台工具" @click="toggleTools">
        <span class="i-lucide-plus size-4 transition" :class="toolsOpen && 'rotate-45'" aria-hidden="true" />
      </Button>
      <div v-if="toolsOpen" class="flex gap-1 items-center">
        <Button type="button" variant="ghost" size="sm" class="text-xs text-muted-foreground font-medium px-3 rounded-full h-8 shadow-none transition hover:text-foreground hover:bg-accent">
          <span class="i-lucide-file-plus-2 size-3.5" aria-hidden="true" />
          附件
        </Button>
        <Button type="button" variant="ghost" size="sm" class="text-xs text-muted-foreground font-medium px-3 rounded-full h-8 shadow-none transition hover:text-foreground hover:bg-accent">
          <span class="i-lucide-sliders-horizontal size-3.5" aria-hidden="true" />
          参数
        </Button>
      </div>
      <div class="ml-auto flex shrink gap-1 min-w-0 items-center">
        <div class="text-xs text-muted-foreground font-medium px-2 rounded-lg bg-transparent inline-flex h-7 items-center">
          Workspace Preset
        </div>
        <Button type="button" size="sm" class="text-xs font-semibold px-3 rounded-full h-8 shadow-sm" :disabled="!canSubmit" @click="emit('submit')">
          <span class="i-lucide-send-horizontal size-3.5" aria-hidden="true" />
          执行
        </Button>
      </div>
    </div>
  </section>
</template>
