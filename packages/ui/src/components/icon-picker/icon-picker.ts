import type { ExtractPropTypes, PropType } from 'vue'
import type { IconCollection } from './collection'
import { lucideIconCollection } from './collection'

export type IconPickerValue = '' | `i-${string}-${string}`

export const iconPickerProps = {
  collection: {
    type: Object as PropType<IconCollection>,
    default: () => lucideIconCollection,
  },
  modelValue: {
    type: String as PropType<IconPickerValue>,
    default: '',
  },
  placeholder: {
    type: String,
    default: '搜索图标',
  },
} as const

export const iconPickerEmits = {
  'update:modelValue': (value: IconPickerValue) => typeof value === 'string',
} as const

export type IconPickerProps = ExtractPropTypes<typeof iconPickerProps>
export type IconPickerEmits = typeof iconPickerEmits
