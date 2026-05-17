<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-3 border-t border-gray-100 px-3 py-3 dark:border-dark-700 sm:flex-row sm:items-center sm:justify-between', props.class)">
    <slot />
  </div>
</template>
