<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  tooltip?: string
  label?: string
  class?: HTMLAttributes['class']
}>(), {
  tooltip: '',
  label: ''
})
</script>

<template>
  <button
    type="button"
    :title="props.tooltip || props.label"
    :aria-label="props.label || props.tooltip"
    :class="cn('inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-300', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
