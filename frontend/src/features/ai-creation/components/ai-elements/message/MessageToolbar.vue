<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('mt-3 flex w-full items-center justify-between gap-4', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
