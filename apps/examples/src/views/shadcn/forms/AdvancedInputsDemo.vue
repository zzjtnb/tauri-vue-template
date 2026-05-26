<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import { Button, Calendar, Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList, ComboboxTrigger, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, NativeSelect, NativeSelectOptGroup, NativeSelectOption, NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, PinInput, PinInputGroup, PinInputSeparator, PinInputSlot, RangeCalendar, Separator, Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle, StepperTrigger, TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@tauri-vue-template/ui'
import { Check, ChevronsUpDown, Minus, Plus, Search, X } from 'lucide-vue-next'
import { computed, shallowRef } from 'vue'

const nativeValue = shallowRef('typescript')
const numberValue = shallowRef(3)
const otpValue = shallowRef('123456')
const pinValue = shallowRef<number[]>([2, 0, 2, 6])
const tags = shallowRef(['Vue', 'shadcn-vue'])
const comboboxValue = shallowRef('vue')
const calendarDate = shallowRef(new CalendarDate(2026, 5, 23))
const rangeDate = shallowRef({
  start: new CalendarDate(2026, 5, 18),
  end: new CalendarDate(2026, 5, 24),
})

const frameworks = [
  { value: 'vue', label: 'Vue' },
  { value: 'vite', label: 'Vite' },
  { value: 'reka', label: 'Reka UI' },
  { value: 'unocss', label: 'UnoCSS' },
]

const selectedFramework = computed(() => {
  return frameworks.find(item => item.value === comboboxValue.value)?.label ?? '请选择'
})

const steps = [
  { step: 1, title: '安装', description: '组件已存在于 ui 目录。' },
  { step: 2, title: '示例', description: '补齐可运行示例。' },
  { step: 3, title: '验证', description: '执行静态检查。' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="gap-5 grid lg:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          InputGroup 输入组合
        </h3>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="搜索组件名称" />
          <InputGroupButton>
            搜索
          </InputGroupButton>
        </InputGroup>
        <InputGroup>
          <InputGroupText>备注</InputGroupText>
          <InputGroupTextarea placeholder="支持多行内容" />
        </InputGroup>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          NativeSelect 原生选择器
        </h3>
        <NativeSelect v-model="nativeValue" class="w-[220px]">
          <NativeSelectOptGroup label="技术栈">
            <NativeSelectOption value="typescript">
              TypeScript
            </NativeSelectOption>
            <NativeSelectOption value="vue">
              Vue
            </NativeSelectOption>
            <NativeSelectOption value="vite">
              Vite
            </NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
        <p class="text-sm text-muted-foreground">
          当前选择：{{ nativeValue }}
        </p>
      </div>
    </div>

    <Separator />

    <div class="gap-5 grid lg:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          NumberField 数字输入
        </h3>
        <NumberField v-model="numberValue" :min="1" :max="9">
          <NumberFieldContent>
            <NumberFieldDecrement>
              <Minus />
            </NumberFieldDecrement>
            <NumberFieldInput />
            <NumberFieldIncrement>
              <Plus />
            </NumberFieldIncrement>
          </NumberFieldContent>
        </NumberField>
        <p class="text-sm text-muted-foreground">
          当前数量：{{ numberValue }}
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          Combobox 组合选择
        </h3>
        <Combobox v-model="comboboxValue">
          <ComboboxAnchor class="w-[260px]">
            <div class="relative">
              <ComboboxInput
                class="pr-8"
                placeholder="搜索框架"
                :display-value="(value: unknown) => frameworks.find(item => item.value === value)?.label ?? ''"
              />
              <ComboboxTrigger class="px-2 flex items-center inset-y-0 right-0 absolute">
                <ChevronsUpDown class="opacity-50" />
              </ComboboxTrigger>
            </div>
          </ComboboxAnchor>
          <ComboboxList class="w-[260px]">
            <ComboboxEmpty>未找到框架</ComboboxEmpty>
            <ComboboxGroup heading="框架">
              <ComboboxItem v-for="framework in frameworks" :key="framework.value" :value="framework.value">
                {{ framework.label }}
                <ComboboxItemIndicator>
                  <Check />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
        <p class="text-sm text-muted-foreground">
          当前选择：{{ selectedFramework }}
        </p>
      </div>
    </div>

    <Separator />

    <div class="gap-5 grid lg:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          InputOTP 一次性验证码
        </h3>
        <InputOTP v-model="otpValue" :maxlength="6">
          <InputOTPGroup>
            <InputOTPSlot v-for="index in 3" :key="index" :index="index - 1" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot v-for="index in 3" :key="index" :index="index + 2" />
          </InputOTPGroup>
        </InputOTP>
        <p class="text-sm text-muted-foreground">
          当前验证码：{{ otpValue }}
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          PinInput 分段输入
        </h3>
        <PinInput v-model="pinValue" type="number" placeholder="0">
          <PinInputGroup>
            <PinInputSlot v-for="index in 2" :key="index" :index="index - 1" />
          </PinInputGroup>
          <PinInputSeparator />
          <PinInputGroup>
            <PinInputSlot v-for="index in 2" :key="index" :index="index + 1" />
          </PinInputGroup>
        </PinInput>
        <p class="text-sm text-muted-foreground">
          当前 PIN：{{ pinValue.join('') }}
        </p>
      </div>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        TagsInput 标签输入
      </h3>
      <TagsInput v-model="tags" class="max-w-xl">
        <TagsInputItem v-for="tag in tags" :key="tag" :value="tag">
          <TagsInputItemText />
          <TagsInputItemDelete>
            <X />
          </TagsInputItemDelete>
        </TagsInputItem>
        <TagsInputInput placeholder="添加标签后按 Enter" />
      </TagsInput>
      <p class="text-sm text-muted-foreground">
        当前标签：{{ tags.join('、') }}
      </p>
    </div>

    <Separator />

    <div class="gap-5 grid xl:grid-cols-2">
      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          Calendar 日期选择
        </h3>
        <Calendar v-model="calendarDate" locale="zh-CN" layout="month-and-year" class="border rounded-md w-fit" />
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          RangeCalendar 日期范围
        </h3>
        <RangeCalendar v-model="rangeDate" locale="zh-CN" :number-of-months="1" class="border rounded-md w-fit" />
      </div>
    </div>

    <Separator />

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Stepper 步骤条
      </h3>
      <Stepper :default-value="2" class="flex gap-2 w-full items-start">
        <template v-for="item in steps" :key="item.step">
          <StepperItem
            v-slot="{ state }"
            :step="item.step"
            class="flex flex-col w-full items-center justify-center relative"
          >
            <StepperTrigger as-child>
              <Button
                :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                size="icon"
                class="rounded-full shrink-0 z-10"
                :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
              >
                <Check v-if="state === 'completed'" aria-hidden="true" />
                <span v-else>{{ item.step }}</span>
              </Button>
            </StepperTrigger>
            <StepperSeparator
              v-if="item.step !== steps[steps.length - 1]?.step"
              class="rounded-full bg-muted shrink-0 h-0.5 block left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 absolute group-data-[state=completed]:bg-primary"
            />
            <div class="mt-5 text-center flex flex-col items-center">
              <StepperTitle
                class="text-sm font-semibold transition lg:text-base"
                :class="[state === 'active' && 'text-primary']"
              >
                {{ item.title }}
              </StepperTitle>
              <StepperDescription
                class="text-xs text-muted-foreground transition lg:text-sm"
                :class="[state === 'active' && 'text-primary']"
              >
                {{ item.description }}
              </StepperDescription>
            </div>
          </StepperItem>
        </template>
      </Stepper>
    </div>
  </div>

  <Separator />
</template>
