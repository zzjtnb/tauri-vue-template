<script setup lang="ts">
import type { ButtonVariants } from '@ui/shadcn-vue/ui/button'
import type { PaginationListItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@ui/shadcn-vue/lib/utils'
import { buttonVariants } from '@ui/shadcn-vue/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { PaginationListItem } from 'reka-ui'

const props = withDefaults(defineProps<PaginationListItemProps & {
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  isActive?: boolean
}>(), {
  size: 'icon',
})

const delegatedProps = reactiveOmit(props, 'class', 'size', 'isActive')
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      props.class)"
  >
    <slot />
  </PaginationListItem>
</template>
