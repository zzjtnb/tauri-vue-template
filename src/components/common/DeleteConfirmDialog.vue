<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shadcn-vue/ui/alert-dialog'
import { Button } from '@/components/shadcn-vue/ui/button'
import { Spinner } from '@/components/shadcn-vue/ui/spinner'

interface Props {
  open: boolean
  title: string
  description: string
  loading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  confirmLabel: '确认',
  cancelLabel: '取消',
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'confirm': []
}>()

function handleOpenChange(open: boolean): void {
  emit('update:open', open)
}

function handleConfirm(): void {
  emit('confirm')
}
</script>

<template>
  <AlertDialog :open="props.open" @update:open="handleOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ props.description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel as-child :disabled="props.loading">
          <Button type="button" variant="outline" size="default" :disabled="props.loading">
            {{ props.cancelLabel }}
          </Button>
        </AlertDialogCancel>
        <Button type="button" variant="destructive" size="default" :disabled="props.loading" @click="handleConfirm">
          <Spinner v-if="props.loading" class="size-4" />
          {{ props.confirmLabel }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
