<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../lib/cn'

const props = defineProps<{
  from: 'system' | 'user' | 'assistant'
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn(
      'group flex w-full max-w-[88%] gap-2',
      props.from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
      props.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
