<script setup lang="ts">
import type { Activity } from './types'
import type { AuthResponse } from '@/api/template/types'
import { shallowRef } from 'vue'
import ActivityStream from './activity/index.vue'
import AuthDialog from './AuthDialog.vue'
import CommandBar from './command/index.vue'

const command = shallowRef('')
const pendingCommand = shallowRef('')
const authDialogOpen = shallowRef(false)
const authenticated = shallowRef(false)
const userName = shallowRef('')
const activities = shallowRef<Activity[]>([])
const scrollToBottomVersion = shallowRef(0)
let nextActivityId = 1

function appendActivity(input: string): void {
  activities.value = [
    ...activities.value,
    {
      id: nextActivityId++,
      source: 'user',
      title: '执行命令',
      description: input,
    },
    {
      id: nextActivityId++,
      source: 'system',
      title: '工作台建议',
      description: '已根据当前命令生成一组执行建议。你可以继续补充上下文、拆分任务或记录验收结果。',
    },
  ]
  scrollToBottomVersion.value += 1
}

function runCommand(input: string): void {
  appendActivity(input)
}

function requireAuth(input: string): void {
  pendingCommand.value = input
  authDialogOpen.value = true
}

function submitCommand(): void {
  const input = command.value.trim()
  if (!input) {
    return
  }

  command.value = ''
  if (!authenticated.value) {
    requireAuth(input)
    return
  }

  runCommand(input)
}

function startWorkspace(input: string): void {
  if (!authenticated.value) {
    requireAuth(input)
    return
  }

  runCommand(input)
}

function handleAuthenticated(response: AuthResponse): void {
  authenticated.value = true
  userName.value = response.user.name
  const input = pendingCommand.value
  pendingCommand.value = ''
  if (input) {
    runCommand(input)
  }
}
</script>

<template>
  <section aria-label="智能工作台模板" class="flex flex-1 flex-col min-h-0 relative overflow-hidden isolate">
    <div aria-hidden="true" class="h-72 pointer-events-none inset-x-0 top-0 absolute from-primary/10 to-transparent via-accent/30 bg-gradient-to-b" />
    <ActivityStream
      class="flex-1 min-h-0 relative z-10"
      :activities="activities"
      :scroll-to-bottom-version="scrollToBottomVersion"
      @start="startWorkspace"
    />
    <div class="px-3 pb-3 pt-5 shrink-0 relative z-20 from-background to-transparent via-background/95 bg-gradient-to-t md:px-6 md:pb-4">
      <CommandBar v-model="command" @submit="submitCommand" />
      <p v-if="authenticated" class="text-xs text-muted-foreground mt-2 text-center">
        当前工作台用户：{{ userName }}
      </p>
    </div>
    <AuthDialog v-model:open="authDialogOpen" @authenticated="handleAuthenticated" />
  </section>
</template>
