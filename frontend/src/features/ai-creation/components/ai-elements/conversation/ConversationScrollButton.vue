<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { cn } from '../../lib/cn'
import { useConversationContext } from './context'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { isAtBottom, scrollToBottom } = useConversationContext()

function handleScrollToBottom() {
  scrollToBottom()
}
</script>

<template>
  <button
    v-if="!isAtBottom"
    type="button"
    aria-label="滚动到底部"
    :class="cn('absolute bottom-4 left-1/2 inline-flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-card transition-colors hover:text-primary-600 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-300 dark:hover:text-primary-300', props.class)"
    @click="handleScrollToBottom"
  >
    <Icon name="arrowDown" size="sm" />
  </button>
</template>
