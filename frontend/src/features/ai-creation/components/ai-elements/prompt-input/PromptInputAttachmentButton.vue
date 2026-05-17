<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { cn } from '../../lib/cn'
import { usePromptInput } from './context'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  label?: string
  iconOnly?: boolean
}>(), {
  label: '上传文件',
  iconOnly: false
})

const { openFileDialog } = usePromptInput()
</script>

<template>
  <button
    type="button"
    :aria-label="props.label"
    :title="props.label"
    :class="cn('inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-300 dark:hover:border-dark-600 dark:hover:text-white', props.iconOnly ? 'w-9 px-0' : 'px-3', props.class)"
    @click="openFileDialog"
  >
    <Icon name="upload" size="sm" />
    <span v-if="!props.iconOnly">{{ props.label }}</span>
  </button>
</template>
