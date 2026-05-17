<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PromptInputMessage } from './types'
import { cn } from '../../lib/cn'
import { usePromptInputProvider } from './context'

const props = defineProps<{
  class?: HTMLAttributes['class']
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxFileSize?: number
  initialInput?: string
}>()

const emit = defineEmits<{
  (event: 'submit', payload: PromptInputMessage): void
  (event: 'error', payload: { code: string; message: string }): void
}>()

const { fileInputRef, addFiles, submitForm } = usePromptInputProvider({
  initialInput: props.initialInput,
  maxFiles: props.maxFiles,
  maxFileSize: props.maxFileSize,
  accept: props.accept,
  onSubmit: (message) => emit('submit', message),
  onError: (error) => emit('error', error)
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files)
}
</script>

<template>
  <div>
    <input
      ref="fileInputRef"
      class="hidden"
      type="file"
      :accept="props.accept"
      :multiple="props.multiple"
      @change="handleFileChange"
    />
    <form
      autocomplete="off"
      :class="cn('w-full rounded-2xl border border-gray-200 bg-white shadow-card transition-colors focus-within:border-primary-400 dark:border-dark-700 dark:bg-dark-800', props.class)"
      @submit.prevent="submitForm"
      @dragover.prevent
      @drop.prevent.stop="handleDrop"
    >
      <slot />
    </form>
  </div>
</template>
