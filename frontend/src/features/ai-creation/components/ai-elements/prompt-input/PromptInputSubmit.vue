<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PromptInputStatus } from './types'
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  status?: PromptInputStatus
  disabled?: boolean
}>(), {
  status: 'ready',
  disabled: false
})

const icon = computed(() => {
  if (props.status === 'streaming') return 'x'
  if (props.status === 'error') return 'xCircle'
  return 'arrowUp'
})
</script>

<template>
  <button
    type="submit"
    :disabled="props.disabled"
    aria-label="发送"
    :class="cn('inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-card transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600', props.class)"
    v-bind="$attrs"
  >
    <Icon :name="icon" size="sm" :class="props.status === 'submitted' && 'animate-spin'" />
  </button>
</template>
