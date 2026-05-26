<script setup lang="ts">
import { Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText, Input, Separator } from '@tauri-vue-template/ui'
import { Archive, Mail, Search } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      ButtonGroup 按钮组
    </h3>
    <div class="flex flex-col gap-3">
      <ButtonGroup>
        <Button variant="outline">
          <Mail data-icon="inline-start" />
          收件箱
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline">
          <Archive data-icon="inline-start" />
          归档
        </Button>
      </ButtonGroup>

      <ButtonGroup class="max-w-md w-full">
        <ButtonGroupText>
          <Search />
          搜索
        </ButtonGroupText>
        <Input placeholder="输入关键词" />
        <Button>提交</Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical">
        <Button variant="outline">
          上一步
        </Button>
        <Button variant="outline">
          下一步
        </Button>
      </ButtonGroup>
    </div>
    <p class="text-sm text-muted-foreground">
      ButtonGroup 用同一边界组合按钮、输入框和说明文本，避免手写边框拼接。
    </p>
  </div>

  <Separator />
</template>
