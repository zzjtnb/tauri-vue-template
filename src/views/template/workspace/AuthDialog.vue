<script setup lang="ts">
import type { AuthResponse } from '@/api/template/types'
import { computed, reactive, shallowRef } from 'vue'
import { login, register } from '@/api/template/api'
import { Button } from '@/components/shadcn-vue/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-vue/ui/dialog'
import { Input } from '@/components/shadcn-vue/ui/input'

const emit = defineEmits<{
  authenticated: [response: AuthResponse]
}>()

const open = defineModel<boolean>('open', { required: true })

const mode = shallowRef<'login' | 'register'>('login')
const pending = shallowRef(false)
const errorMessage = shallowRef('')
const form = reactive({
  name: '模板用户',
  email: 'demo@example.com',
  password: 'template-demo',
})

const title = computed(() => mode.value === 'login' ? '登录后继续执行' : '创建工作台账号')
const description = computed(() => mode.value === 'login'
  ? '完成身份确认后会继续处理刚才的工作台命令。'
  : '创建工作台身份后即可继续处理当前命令。')
const submitLabel = computed(() => {
  if (pending.value) {
    return mode.value === 'login' ? '登录中...' : '注册中...'
  }
  return mode.value === 'login' ? '登录并继续' : '注册并继续'
})

function switchMode(nextMode: 'login' | 'register'): void {
  mode.value = nextMode
  errorMessage.value = ''
}

async function submit(): Promise<void> {
  if (pending.value) {
    return
  }

  pending.value = true
  errorMessage.value = ''
  try {
    const response = mode.value === 'login'
      ? await login({ email: form.email, password: form.password })
      : await register({ name: form.name, email: form.email, password: form.password })
    emit('authenticated', response)
    open.value = false
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '授权请求失败'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>

      <div class="gap-3 grid">
        <div class="p-1 rounded-2xl bg-muted gap-2 grid grid-cols-2">
          <Button type="button" size="sm" :variant="mode === 'login' ? 'default' : 'ghost'" class="rounded-xl" @click="switchMode('login')">
            登录
          </Button>
          <Button type="button" size="sm" :variant="mode === 'register' ? 'default' : 'ghost'" class="rounded-xl" @click="switchMode('register')">
            注册
          </Button>
        </div>

        <label v-if="mode === 'register'" class="text-sm font-medium gap-2 grid">
          昵称
          <Input v-model="form.name" autocomplete="name" />
        </label>
        <label class="text-sm font-medium gap-2 grid">
          邮箱
          <Input v-model="form.email" type="email" autocomplete="email" />
        </label>
        <label class="text-sm font-medium gap-2 grid">
          密码
          <Input v-model="form.password" type="password" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" />
        </label>
        <p v-if="errorMessage" class="text-sm text-destructive leading-6">
          {{ errorMessage }}
        </p>
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <Button type="button" variant="outline" :disabled="pending" @click="open = false">
          取消
        </Button>
        <Button type="button" :disabled="pending || !form.email.trim() || !form.password.trim()" @click="submit">
          {{ submitLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
