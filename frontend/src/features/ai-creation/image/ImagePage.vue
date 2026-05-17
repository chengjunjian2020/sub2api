<template>
  <AiCreationShell>
    <div class="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card dark:border-dark-700 dark:bg-dark-900">
      <div class="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-dark-700 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold text-gray-900 dark:text-white">AI 绘图</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">图片生成和历史记录测试。</p>
        </div>
        <div class="grid gap-2 sm:grid-cols-[180px_minmax(220px,1fr)_auto] sm:items-center lg:min-w-[620px]">
          <Select
            v-model="settings.imageModel.value"
            :options="imageModelOptions"
            :searchable="false"
          />
          <Input
            v-model="settings.apiKey.value"
            type="password"
            name="ai-creation-api-key"
            autocomplete="new-password"
            autocapitalize="off"
            autocorrect="off"
            :spellcheck="false"
            placeholder="sk-xxx"
          >
            <template #prefix>
              <Icon name="key" size="sm" />
            </template>
          </Input>
          <button class="btn btn-secondary btn-sm" type="button" @click="copyImagePrompt">
            <Icon name="copy" size="sm" />
            复制
          </button>
        </div>
      </div>

      <div class="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.15fr)] overflow-hidden xl:grid-cols-[420px_minmax(0,1fr)] xl:grid-rows-none">
        <section class="flex min-h-0 flex-col border-b border-gray-200 bg-gray-50/70 dark:border-dark-700 dark:bg-dark-950/60 xl:border-b-0 xl:border-r">
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <TextArea
            v-model="prompt"
            label="提示词"
            name="ai-creation-image-prompt"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            :spellcheck="false"
            :rows="5"
            placeholder="描述你想生成的画面..."
          />

          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="input-label mb-0">比例 / 尺寸</label>
              <span class="text-xs text-gray-400">按所选模型过滤</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in sizeOptions"
                :key="option.value"
                type="button"
                class="rounded-xl border px-3 py-2 text-left text-sm transition-colors"
                :class="size === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-300 dark:hover:border-dark-600'"
                @click="size = option.value"
              >
                <span class="block truncate">{{ option.label }}</span>
                <span class="mt-0.5 block text-xs text-gray-400">{{ option.tier }}</span>
              </button>
            </div>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="input-label mb-0">参考图</label>
              <label class="btn btn-secondary btn-sm cursor-pointer">
                <Icon name="upload" size="sm" />
                上传
                <input class="hidden" type="file" accept="image/*" multiple @change="handleReferenceImages" />
              </label>
            </div>
            <div class="rounded-xl border border-dashed border-gray-200 bg-white p-3 dark:border-dark-700 dark:bg-dark-900/40">
              <div v-if="referenceImages.length" class="grid grid-cols-3 gap-2">
                <div v-for="image in referenceImages" :key="image.id" class="group relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-dark-800">
                  <img :src="image.dataUrl" :alt="image.name" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    class="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    @click="removeReferenceImage(image.id)"
                  >
                    <Icon name="x" size="xs" />
                  </button>
                </div>
              </div>
              <p v-else class="py-5 text-center text-xs text-gray-400">可选，上传后会走图片编辑接口。</p>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-900">
          <button class="btn btn-primary btn-lg w-full" type="button" :disabled="!canGenerate" @click="generate">
            <Icon name="sparkles" size="sm" />
            {{ generating ? '生成中...' : '生成图片' }}
          </button>
          <label class="mt-3 flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-dark-400">
            <Toggle v-model="settings.rememberKey.value" />
            记住 Key
          </label>
          <div v-if="errorMessage" class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {{ errorMessage }}
          </div>
          <p class="mt-3 text-xs leading-relaxed text-gray-400">
            仅用于接口测试，记录只保存在当前浏览器，可随时删除。
          </p>
        </div>
      </section>

      <section class="flex min-h-0 flex-col bg-white dark:bg-dark-900">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-dark-700">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">预览与历史</h3>
            <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">仅显示最近 100 条图片历史。</p>
          </div>
          <button v-if="selectedJob" class="btn btn-secondary btn-sm" type="button" @click="deleteSelectedJob">
            <Icon name="trash" size="sm" />
            删除
          </button>
        </div>

        <div class="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div class="relative flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-dark-700 dark:bg-dark-950/40">
            <AiImage
              v-if="selectedJob?.imageBase64 && selectedJob.mediaType"
              :base64="selectedJob.imageBase64"
              :media-type="selectedJob.mediaType"
              :alt="selectedJob.prompt"
              class="max-h-full max-w-full rounded-xl object-contain shadow-card"
            />
            <img
              v-else-if="selectedJob?.imageUrl"
              :src="selectedJob.imageUrl"
              :alt="selectedJob.prompt"
              class="max-h-full max-w-full rounded-xl object-contain shadow-card"
            />
            <div v-else-if="generating" class="text-center text-gray-500 dark:text-dark-400">
              <LoadingSpinner size="lg" />
              <p class="mt-3 text-sm">生成图片中，中途离开会导致请求失败...</p>
            </div>
            <div v-else class="max-w-sm text-center">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                <Icon name="sparkles" size="xl" />
              </div>
              <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">开始你的创作之旅</h3>
              <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">在左侧输入提示词，生成记录只保存在当前浏览器。</p>
            </div>
            <div v-if="generating && selectedJob?.imageUrl" class="absolute bottom-3 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs text-gray-600 shadow-card backdrop-blur dark:border-dark-700 dark:bg-dark-900/90 dark:text-dark-300">
              生成中...
            </div>
          </div>

          <div class="min-h-0 overflow-y-auto">
            <div v-if="jobs.length" class="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div
                v-for="job in jobs"
                :key="job.id"
                role="button"
                tabindex="0"
                class="group overflow-hidden rounded-xl border text-left transition-colors"
                :class="selectedJobId === job.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 bg-white hover:border-gray-200 dark:border-dark-700 dark:bg-dark-800 dark:hover:border-dark-600'"
                @click="selectedJobId = job.id"
                @keydown.enter.prevent="selectedJobId = job.id"
                @keydown.space.prevent="selectedJobId = job.id"
              >
                <div class="aspect-square bg-gray-50 dark:bg-dark-900">
                  <img v-if="job.imageUrl" :src="job.imageUrl" :alt="job.prompt" class="h-full w-full object-contain" />
                  <div v-else class="flex h-full items-center justify-center text-xs text-gray-400">{{ job.status }}</div>
                </div>
                <div class="flex items-start gap-2 p-2">
                  <div class="min-w-0 flex-1">
                    <p class="line-clamp-2 text-xs leading-5 text-gray-600 dark:text-dark-300" :title="job.prompt">
                      {{ job.prompt }}
                    </p>
                    <p class="mt-1 text-[11px] text-gray-400">{{ formatTime(job.lastTouchedAt) }}</p>
                  </div>
                  <div class="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-primary-600 dark:hover:bg-dark-900 dark:hover:text-primary-300"
                      title="复制提示词"
                      aria-label="复制提示词"
                      @click.stop="copyText(job.prompt)"
                    >
                      <Icon name="copy" size="xs" />
                    </button>
                    <button
                      v-if="job.status === 'error'"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-dark-900 dark:hover:text-primary-300"
                      title="重试"
                      aria-label="重试"
                      :disabled="generating"
                      @click.stop="retryImageJob(job)"
                    >
                      <Icon name="refresh" size="xs" />
                    </button>
                    <button
                      v-if="job.status === 'done' && job.imageUrl"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-primary-600 dark:hover:bg-dark-900 dark:hover:text-primary-300"
                      title="下载图片"
                      aria-label="下载图片"
                      @click.stop="downloadImageJob(job)"
                    >
                      <Icon name="download" size="xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-dark-700 dark:text-dark-400">
              暂无图片历史
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  </AiCreationShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiCreationShell from '../AiCreationShell.vue'
import Icon from '@/components/icons/Icon.vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import TextArea from '@/components/common/TextArea.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Toggle from '@/components/common/Toggle.vue'
import { Image as AiImage } from '../components/ai-elements'
import { generateImage as requestImageGeneration } from '../api/aiClient'
import { getImageSizeOptions, imageModelOptions } from '../config/models'
import { useAiSettings } from '../composables/useAiSettings'
import { createId, deleteImageJob, listImageJobs, saveImageJob } from '../storage/db'
import type { AiImageJob } from '../types'

interface ReferenceImage {
  id: string
  name: string
  dataUrl: string
}

const route = useRoute()
const router = useRouter()
const settings = useAiSettings()

const prompt = ref('')
const size = ref('auto')
const quality = ref('auto')
const background = ref('auto')
const outputFormat = ref('png')
const referenceImages = ref<ReferenceImage[]>([])
const jobs = ref<AiImageJob[]>([])
const selectedJobId = ref<string | null>(null)
const generating = ref(false)
const errorMessage = ref('')

const sizeOptions = computed(() => getImageSizeOptions(settings.imageModel.value))
const selectedJob = computed(() => jobs.value.find((job) => job.id === selectedJobId.value) || null)
const canGenerate = computed(() => settings.hasApiKey.value && prompt.value.trim().length > 0 && !generating.value)

watch(
  () => settings.imageModel.value,
  () => {
    if (!sizeOptions.value.some((option) => option.value === size.value)) {
      size.value = sizeOptions.value[0]?.value ?? 'auto'
    }
  }
)

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(ts))
}

async function refreshJobs() {
  jobs.value = await listImageJobs()
  if (!selectedJobId.value && jobs.value[0]) {
    selectedJobId.value = jobs.value[0].id
  }
}

async function generate() {
  if (!canGenerate.value) {
    if (!settings.hasApiKey.value) errorMessage.value = '请先填写 API Key'
    return
  }

  const now = Date.now()
  const job: AiImageJob = {
    id: createId('img'),
    prompt: prompt.value.trim(),
    model: settings.imageModel.value,
    size: size.value,
    quality: quality.value,
    outputFormat: outputFormat.value,
    background: background.value,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    lastTouchedAt: now
  }

  await runImageJob(job, referenceImages.value.map((image) => image.dataUrl))
}

async function runImageJob(job: AiImageJob, referenceImageUrls: string[] = []) {
  errorMessage.value = ''
  generating.value = true
  let lastPartialSaveAt = 0
  const now = Date.now()
  job.status = 'pending'
  job.error = undefined
  job.imageUrl = undefined
  job.imageBase64 = undefined
  job.mediaType = undefined
  job.revisedPrompt = undefined
  job.updatedAt = now
  job.lastTouchedAt = now

  selectedJobId.value = job.id
  jobs.value = [job, ...jobs.value.filter((item) => item.id !== job.id)].slice(0, 100)
  await saveImageJob({ ...job })

  try {
    const result = await requestImageGeneration({
      apiKey: settings.apiKey.value.trim(),
      model: job.model,
      prompt: job.prompt,
      size: job.size,
      quality: job.quality,
      outputFormat: job.outputFormat,
      background: job.background,
      referenceImages: referenceImageUrls,
      onPartialImage: (partial) => {
        const ts = Date.now()
        job.imageUrl = partial.imageUrl
        job.imageBase64 = partial.imageBase64
        job.mediaType = partial.mediaType
        job.revisedPrompt = partial.revisedPrompt ?? job.revisedPrompt
        job.updatedAt = ts
        job.lastTouchedAt = ts
        jobs.value = [job, ...jobs.value.filter((item) => item.id !== job.id)].slice(0, 100)
        if (ts - lastPartialSaveAt > 1200) {
          lastPartialSaveAt = ts
          void saveImageJob({ ...job })
        }
      }
    })
    job.status = 'done'
    job.imageUrl = result.imageUrl
    job.imageBase64 = result.imageBase64
    job.mediaType = result.mediaType
    job.revisedPrompt = result.revisedPrompt
  } catch (error) {
    job.status = 'error'
    job.error = (error as Error).message || '生成失败'
    errorMessage.value = job.error
  } finally {
    job.updatedAt = Date.now()
    job.lastTouchedAt = job.updatedAt
    generating.value = false
    await saveImageJob({ ...job })
    await refreshJobs()
    selectedJobId.value = job.id
  }
}

async function retryImageJob(job: AiImageJob) {
  if (generating.value) return
  await runImageJob({ ...job })
}

async function handleReferenceImages(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'))
  const images = await Promise.all(files.map(async (file) => ({
    id: createId('ref'),
    name: file.name,
    dataUrl: await fileToDataUrl(file)
  })))
  referenceImages.value = [...referenceImages.value, ...images].slice(0, 4)
  input.value = ''
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function removeReferenceImage(id: string) {
  referenceImages.value = referenceImages.value.filter((image) => image.id !== id)
}

async function deleteSelectedJob() {
  if (!selectedJobId.value) return
  await deleteImageJob(selectedJobId.value)
  selectedJobId.value = null
  await refreshJobs()
}

async function copyImagePrompt() {
  const text = selectedJob.value?.prompt || prompt.value.trim()
  await copyText(text)
}

async function copyText(text: string) {
  if (text) await navigator.clipboard?.writeText(text)
}

function downloadImageJob(job: AiImageJob) {
  const href = job.imageUrl || (
    job.imageBase64 && job.mediaType ? `data:${job.mediaType};base64,${job.imageBase64}` : ''
  )
  if (!href) return

  const link = document.createElement('a')
  link.href = href
  link.download = `ai-image-${new Date(job.createdAt).toISOString().replace(/[:.]/g, '-')}.${imageExtension(job)}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function imageExtension(job: AiImageJob) {
  const format = (job.outputFormat || job.mediaType?.split('/')[1] || 'png').toLowerCase()
  return format === 'jpeg' ? 'jpg' : format
}

onMounted(async () => {
  await settings.initialize(route, router)
  const queryPrompt = Array.isArray(route.query.prompt) ? route.query.prompt[0] : route.query.prompt
  if (queryPrompt) {
    prompt.value = queryPrompt
  }
  await refreshJobs()
})
</script>
