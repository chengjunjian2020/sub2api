<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '../../lib/cn'

const props = defineProps<{
  base64: string
  mediaType: string
  uint8Array?: Uint8Array
  class?: HTMLAttributes['class']
  alt?: string
}>()

const src = computed(() => `data:${props.mediaType};base64,${props.base64}`)
</script>

<template>
  <img
    :src="src"
    :alt="props.alt || ''"
    :class="cn('h-auto max-w-full overflow-hidden rounded-xl', props.class)"
    v-bind="$attrs"
  />
</template>
