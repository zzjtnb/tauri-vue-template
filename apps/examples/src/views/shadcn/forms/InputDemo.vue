<script setup lang="ts">
import { Input, Label, Separator } from '@tauri-vue-template/ui'
import { ref } from 'vue'

const inputValue = ref('')
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Input 输入框
    </h3>
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <Label for="input-1">标准输入框</Label>
        <Input id="input-1" v-model="inputValue" placeholder="请输入内容..." />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="input-2">禁用状态</Label>
        <Input id="input-2" disabled placeholder="禁用的输入框" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="input-3">带图标</Label>
        <div class="relative">
          <span class="i-ri-search-line text-muted-foreground left-3 top-1/2 absolute -translate-y-1/2" />
          <Input id="input-3" class="pl-10" placeholder="搜索..." />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="input-error">错误状态</Label>
        <Input id="input-error" class="border-destructive focus-visible:ring-destructive" placeholder="错误的输入" />
        <p class="text-sm text-destructive">
          这是一个错误提示信息
        </p>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了标准、禁用、带图标和错误状态
    </p>
  </div>

  <Separator />
</template>
