<script setup lang="ts">
import AdvancedInputsDemo from './AdvancedInputsDemo.vue'
import CheckboxDemo from './CheckboxDemo.vue'
import FieldFormDemo from './FieldFormDemo.vue'
import InputDemo from './InputDemo.vue'
import RadioGroupDemo from './RadioGroupDemo.vue'
import SelectDemo from './SelectDemo.vue'
import SliderDemo from './SliderDemo.vue'
import SwitchDemo from './SwitchDemo.vue'
import TextareaDemo from './TextareaDemo.vue'
</script>

<template>
  <div class="flex flex-col gap-6">
    <InputDemo />
    <FieldFormDemo />
    <AdvancedInputsDemo />
    <TextareaDemo />
    <CheckboxDemo />
    <SwitchDemo />
    <RadioGroupDemo />
    <SelectDemo />
    <SliderDemo />
  </div>
</template>
