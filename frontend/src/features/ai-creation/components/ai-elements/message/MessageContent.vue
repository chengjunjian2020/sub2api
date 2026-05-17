<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn(
      'flex w-fit max-w-full flex-col gap-2 overflow-hidden rounded-2xl border px-4 py-3 text-sm leading-7 shadow-sm',
      'group-[.is-user]:border-primary-200 group-[.is-user]:bg-primary-50 group-[.is-user]:text-primary-950',
      'group-[.is-assistant]:border-gray-100 group-[.is-assistant]:bg-white group-[.is-assistant]:text-gray-800',
      'dark:group-[.is-user]:border-primary-800 dark:group-[.is-user]:bg-primary-900/20 dark:group-[.is-user]:text-primary-50',
      'dark:group-[.is-assistant]:border-dark-700 dark:group-[.is-assistant]:bg-dark-800 dark:group-[.is-assistant]:text-gray-100',
      props.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
