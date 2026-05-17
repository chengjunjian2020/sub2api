<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
  label?: string
}>(), {
  disabled: false,
  label: ''
})
</script>

<template>
  <button
    type="button"
    :disabled="props.disabled"
    :aria-label="props.label || undefined"
    :title="props.label || undefined"
    :class="cn('inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-300 dark:hover:border-dark-600 dark:hover:text-white', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
