import type { Ref } from 'vue'

export interface AttachmentFile {
  id: string
  type: 'file'
  mediaType: string
  filename?: string
  url: string
  file?: File
}

export interface PromptInputMessage {
  text: string
  files: AttachmentFile[]
}

export interface PromptInputContext {
  textInput: Ref<string>
  files: Ref<AttachmentFile[]>
  isLoading: Ref<boolean>
  fileInputRef: Ref<HTMLInputElement | null>
  setTextInput: (value: string) => void
  addFiles: (files: File[] | FileList) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearInput: () => void
  openFileDialog: () => void
  submitForm: () => Promise<void>
}

export type PromptInputStatus = 'ready' | 'streaming' | 'submitted' | 'error'

export const PROMPT_INPUT_KEY = Symbol('PromptInputContext')
