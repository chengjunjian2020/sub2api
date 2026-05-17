<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { cn } from '../../lib/cn'
import { usePromptInput } from './context'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { files, removeFile } = usePromptInput()
</script>

<template>
  <div v-if="files.length" :class="cn('flex flex-wrap gap-2 border-b border-gray-100 px-3 py-2 dark:border-dark-700', props.class)">
    <span
      v-for="file in files"
      :key="file.id"
      class="inline-flex max-w-full items-center gap-2 rounded-xl bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:bg-dark-700 dark:text-dark-300"
    >
      <span class="truncate">{{ file.filename || 'attachment' }}</span>
      <button type="button" class="text-gray-400 hover:text-red-500" @click="removeFile(file.id)">
        <Icon name="x" size="xs" />
      </button>
    </span>
  </div>
</template>
