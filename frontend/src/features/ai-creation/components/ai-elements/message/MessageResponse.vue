<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useSlots } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { cn } from '../../lib/cn'

const props = defineProps<{
  content?: string
  class?: HTMLAttributes['class']
}>()

const slots = useSlots()
const slotContent = computed(() => {
  const nodes = slots.default?.()
  if (!Array.isArray(nodes)) return undefined

  let text = ''
  nodes.forEach((node) => {
    if (typeof node.children === 'string') text += node.children
  })
  return text || undefined
})

const html = computed(() => {
  const raw = slotContent.value ?? props.content ?? ''
  return DOMPurify.sanitize(marked.parse(raw, { async: false }) as string)
})
</script>

<template>
  <div
    :class="cn('ai-elements-response size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', props.class)"
    v-bind="$attrs"
    v-html="html"
  ></div>
</template>

<style scoped>
.ai-elements-response :deep(pre) {
  @apply my-3 overflow-x-auto rounded-xl bg-gray-950 p-3 text-xs text-gray-100;
}

.ai-elements-response :deep(code) {
  @apply rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-dark-900;
}

.ai-elements-response :deep(pre code) {
  @apply bg-transparent p-0 text-gray-100;
}

.ai-elements-response :deep(ul),
.ai-elements-response :deep(ol) {
  @apply my-2 pl-5;
}

.ai-elements-response :deep(ul) {
  @apply list-disc;
}

.ai-elements-response :deep(ol) {
  @apply list-decimal;
}
</style>
