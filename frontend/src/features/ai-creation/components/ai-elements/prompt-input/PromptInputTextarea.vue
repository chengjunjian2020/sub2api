<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref } from 'vue'
import { cn } from '../../lib/cn'
import { usePromptInput } from './context'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  name?: string
  placeholder?: string
  disabled?: boolean
  autocomplete?: string
  autocapitalize?: string
  autocorrect?: string
  spellcheck?: boolean | 'true' | 'false'
}>(), {
  name: 'ai-creation-message',
  placeholder: 'What would you like to know?',
  disabled: false,
  autocomplete: 'off',
  autocapitalize: 'off',
  autocorrect: 'off',
  spellcheck: false
})

const { textInput, setTextInput, addFiles, files, removeFile } = usePromptInput()
const isComposing = ref(false)

const modelValue = computed({
  get: () => textInput.value,
  set: (value: string) => setTextInput(value)
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (event.shiftKey || event.isComposing || isComposing.value) return
    event.preventDefault()
    ;(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit()
  }

  if (event.key === 'Backspace' && textInput.value === '' && files.value.length > 0) {
    event.preventDefault()
    removeFile(files.value[files.value.length - 1].id)
  }
}

function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  const pastedFiles = Array.from(items)
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file))

  if (pastedFiles.length > 0) {
    event.preventDefault()
    addFiles(pastedFiles)
  }
}
</script>

<template>
  <textarea
    v-model="modelValue"
    :name="props.name"
    :autocomplete="props.autocomplete"
    :autocapitalize="props.autocapitalize"
    :autocorrect="props.autocorrect"
    :spellcheck="props.spellcheck"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="cn('min-h-[88px] w-full resize-none bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-dark-500', props.class)"
    @keydown="handleKeyDown"
    @paste="handlePaste"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  />
</template>
