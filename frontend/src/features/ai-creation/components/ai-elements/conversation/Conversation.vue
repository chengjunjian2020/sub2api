<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { nextTick, onUpdated, provide, ref } from 'vue'
import { cn } from '../../lib/cn'
import { ConversationKey } from './context'

const props = withDefaults(defineProps<{
  ariaLabel?: string
  class?: HTMLAttributes['class']
  initial?: boolean | 'instant' | { damping?: number; stiffness?: number; mass?: number }
  resize?: 'instant' | { damping?: number; stiffness?: number; mass?: number }
  damping?: number
  stiffness?: number
  mass?: number
  anchor?: 'auto' | 'none'
}>(), {
  ariaLabel: 'Conversation',
  initial: true,
  damping: 0.7,
  stiffness: 0.05,
  mass: 1.25,
  anchor: 'none'
})

const scrollerRef = ref<HTMLElement | null>(null)
const isAtBottom = ref(true)

function updateAtBottom() {
  const el = scrollerRef.value
  if (!el) return
  isAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 24
}

function scrollToBottom() {
  const el = scrollerRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}

onUpdated(() => {
  if (isAtBottom.value) {
    nextTick(scrollToBottom)
  }
})

provide(ConversationKey, {
  isAtBottom,
  scrollToBottom
})
</script>

<template>
  <div
    ref="scrollerRef"
    :aria-label="props.ariaLabel"
    :class="cn('relative flex-1 overflow-y-auto', props.class)"
    role="log"
    @scroll="updateAtBottom"
  >
    <slot />
  </div>
</template>
