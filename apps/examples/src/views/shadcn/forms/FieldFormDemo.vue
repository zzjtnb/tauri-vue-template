<script setup lang="ts">
import { Button, Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Separator, Switch, Form as VeeForm } from '@tauri-vue-template/ui'
import { toTypedSchema } from '@vee-validate/zod'
import { shallowRef } from 'vue'
import { z } from 'zod'

const submitMessage = shallowRef('尚未提交')

const formSchema = toTypedSchema(z.object({
  email: z.string().email('请输入有效邮箱地址'),
}))

function onFormSubmit(values: Record<string, unknown>) {
  submitMessage.value = `已提交邮箱：${values.email}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Field 字段布局
      </h3>
      <FieldGroup>
        <Field>
          <FieldLabel for="field-demo-name">
            项目名称
          </FieldLabel>
          <Input id="field-demo-name" default-value="AI Agent Front" />
          <FieldDescription>
            FieldGroup 统一管理字段间距，FieldLabel、FieldDescription 明确字段语义。
          </FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Switch id="field-demo-switch" :model-value="true" />
          <FieldContent>
            <FieldTitle>启用运行日志</FieldTitle>
            <FieldDescription>
              横向 Field 适合开关、复选框、单选框这类短字段。
            </FieldDescription>
          </FieldContent>
        </Field>

        <FieldSeparator>校验状态</FieldSeparator>

        <Field data-invalid>
          <FieldLabel for="field-demo-error">
            错误字段
          </FieldLabel>
          <Input id="field-demo-error" aria-invalid default-value="bad-email" />
          <FieldError :errors="['邮箱格式不正确']" />
        </Field>

        <FieldSet>
          <FieldLegend>字段集合</FieldLegend>
          <FieldDescription>
            FieldSet 用于组合一组相关输入，避免用普通标题伪装字段组。
          </FieldDescription>
        </FieldSet>
      </FieldGroup>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Form 表单校验
      </h3>
      <VeeForm
        :validation-schema="formSchema"
        :initial-values="{ email: 'demo@example.com' }"
        class="max-w-md"
        @submit="onFormSubmit"
      >
        <FieldGroup>
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" v-bind="componentField" />
              </FormControl>
              <FormDescription>
                FormControl 会把字段 id、描述和错误状态传给实际输入控件。
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button type="submit">
            提交表单
          </Button>
        </FieldGroup>
      </VeeForm>
      <p class="text-sm text-muted-foreground">
        {{ submitMessage }}
      </p>
    </div>
  </div>

  <Separator />
</template>
