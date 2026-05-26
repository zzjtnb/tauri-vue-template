<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/shadcn-vue/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/shadcn-vue/ui/select'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const selectValue = ref('')
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Select 选择器
    </h3>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 w-[180px]">
        <Label>选择一个水果</Label>
        <Select v-model="selectValue">
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>水果</SelectLabel>
              <SelectItem value="apple">
                苹果
              </SelectItem>
              <SelectItem value="banana">
                香蕉
              </SelectItem>
              <SelectItem value="orange">
                橙子
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p class="text-sm text-muted-foreground">
          已选择: {{ selectValue || '无' }}
        </p>
      </div>
      <div class="flex flex-col gap-2 w-[180px]">
        <Label>禁用状态</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="禁用的选择器" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>水果</SelectLabel>
              <SelectItem value="apple">
                苹果
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了选择器的正常和禁用状态
    </p>
  </div>

  <Separator />
</template>
