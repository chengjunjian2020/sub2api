import type { AttachmentFile, PromptInputContext, PromptInputMessage } from './types'
import { inject, onBeforeUnmount, provide, ref } from 'vue'
import { PROMPT_INPUT_KEY } from './types'

function createAttachmentId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `file_${crypto.randomUUID()}`
  }
  return `file_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function revokeObjectUrl(file: AttachmentFile) {
  if (file.url.startsWith('blob:')) URL.revokeObjectURL(file.url)
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true

  const patterns = accept.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return name.endsWith(pattern)
    if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1))
    return type === pattern
  })
}

function blobUrlToDataUrl(url: string): Promise<string | null> {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result || ''))
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    }))
    .catch(() => null)
}

export function usePromptInputProvider(props: {
  initialInput?: string
  maxFiles?: number
  maxFileSize?: number
  accept?: string
  onSubmit?: (message: PromptInputMessage) => void | Promise<void>
  onError?: (error: { code: string; message: string }) => void
}): PromptInputContext {
  const textInput = ref(props.initialInput || '')
  const files = ref<AttachmentFile[]>([])
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const isLoading = ref(false)

  onBeforeUnmount(() => {
    files.value.forEach(revokeObjectUrl)
  })

  const setTextInput = (value: string) => {
    textInput.value = value
  }

  const addFiles = (incoming: File[] | FileList) => {
    const nextFiles = Array.from(incoming)
    const accepted = nextFiles.filter((file) => matchesAccept(file, props.accept))

    if (nextFiles.length > 0 && accepted.length === 0) {
      props.onError?.({ code: 'accept', message: '没有文件符合当前允许的类型。' })
      return
    }

    const sized = accepted.filter((file) => !props.maxFileSize || file.size <= props.maxFileSize)
    if (accepted.length > 0 && sized.length === 0) {
      props.onError?.({ code: 'max_file_size', message: '文件超过大小限制。' })
      return
    }

    const capacity = props.maxFiles ? Math.max(0, props.maxFiles - files.value.length) : sized.length
    const capped = sized.slice(0, capacity)
    if (sized.length > capped.length) {
      props.onError?.({ code: 'max_files', message: '文件数量超过限制，已自动忽略部分文件。' })
    }

    files.value = [
      ...files.value,
      ...capped.map((file) => ({
        id: createAttachmentId(),
        type: 'file' as const,
        mediaType: file.type || 'application/octet-stream',
        filename: file.name,
        url: URL.createObjectURL(file),
        file
      }))
    ]
  }

  const removeFile = (id: string) => {
    const file = files.value.find((item) => item.id === id)
    if (file) revokeObjectUrl(file)
    files.value = files.value.filter((item) => item.id !== id)
  }

  const clearFiles = () => {
    files.value.forEach(revokeObjectUrl)
    files.value = []
  }

  const clearInput = () => {
    textInput.value = ''
  }

  const openFileDialog = () => {
    fileInputRef.value?.click()
  }

  const submitForm = async () => {
    if (!props.onSubmit) return

    const submittedText = textInput.value
    const submittedFiles = [...files.value]
    const processedFiles = await Promise.all(
      submittedFiles.map(async (file) => {
        if (!file.url.startsWith('blob:')) return file
        const dataUrl = await blobUrlToDataUrl(file.url)
        return dataUrl ? { ...file, url: dataUrl } : file
      })
    )

    try {
      isLoading.value = true
      clearInput()
      clearFiles()
      await props.onSubmit({ text: submittedText, files: processedFiles })
    } catch (error) {
      textInput.value = submittedText
      files.value = submittedFiles
      const message = error instanceof Error ? error.message : String(error)
      props.onError?.({ code: 'submit_error', message })
    } finally {
      isLoading.value = false
    }
  }

  const context: PromptInputContext = {
    textInput,
    files,
    isLoading,
    fileInputRef,
    setTextInput,
    addFiles,
    removeFile,
    clearFiles,
    clearInput,
    openFileDialog,
    submitForm
  }

  provide(PROMPT_INPUT_KEY, context)
  return context
}

export function usePromptInput(): PromptInputContext {
  const context = inject<PromptInputContext>(PROMPT_INPUT_KEY)
  if (!context) {
    throw new Error('usePromptInput must be used within a PromptInput component')
  }
  return context
}
