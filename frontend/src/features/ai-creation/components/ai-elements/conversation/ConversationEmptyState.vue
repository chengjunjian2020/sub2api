<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  title?: string
  description?: string
}>(), {
  title: 'No messages yet',
  description: 'Start a conversation to see messages here'
})
</script>

<template>
  <div
    :class="cn('flex size-full min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center', props.class)"
    v-bind="$attrs"
  >
    <slot>
      <div v-if="$slots.icon" class="text-primary-600 dark:text-primary-300">
        <slot name="icon" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ props.title }}
        </h3>
        <p v-if="props.description" class="mt-2 text-sm text-gray-500 dark:text-dark-400">
          {{ props.description }}
        </p>
      </div>
    </slot>
  </div>
</template>
