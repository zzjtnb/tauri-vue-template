<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Separator } from '@/components/shadcn-vue/ui/separator'
import { Textarea } from '@/components/shadcn-vue/ui/textarea'

const textareaValue = ref('这是一段示例文本...')

const textareas = [
  { id: 'basic', label: '基础文本域', placeholder: '请输入内容...', disabled: false, rows: undefined, hasValue: false },
  { id: 'with-value', label: '带默认值', placeholder: '', disabled: false, rows: undefined, hasValue: true },
  { id: 'disabled', label: '禁用状态', placeholder: '禁用的文本域', disabled: true, rows: undefined, hasValue: false },
  { id: 'rows', label: '自定义行数（rows="6"）', placeholder: '更高的文本域...', disabled: false, rows: 6, hasValue: false },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Textarea 文本域
    </h3>
    <div class="flex flex-col gap-4">
      <div v-for="textarea in textareas" :key="textarea.id" class="flex flex-col gap-2">
        <Label :for="textarea.id">{{ textarea.label }}</Label>
        <Textarea
          :id="textarea.id"
          :model-value="textarea.hasValue ? textareaValue : undefined"
          :placeholder="textarea.placeholder"
          :disabled="textarea.disabled"
          :rows="textarea.rows"
          @update:model-value="(val: string | number) => textarea.hasValue && (textareaValue = String(val))"
        />
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      当前值：{{ textareaValue }}
    </p>
  </div>

  <Separator />
</template>
