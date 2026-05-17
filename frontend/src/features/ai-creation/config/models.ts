import type { ImageSizeOption } from '../types'

export const DEFAULT_CHAT_MODEL = 'gpt-5.4-mini'
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2'

export const chatModelOptions = [
  { value: 'gpt-5.5', label: 'gpt-5.5' },
  { value: 'gpt-5.4', label: 'gpt-5.4' },
  { value: 'gpt-5.4-mini', label: 'gpt-5.4-mini' },
  { value: 'gpt-5.3-codex', label: 'gpt-5.3-codex' },
  { value: 'gpt-5.3-codex-spark', label: 'gpt-5.3-codex-spark' },
  { value: 'gpt-5.2', label: 'gpt-5.2' }
]

export const imageModelOptions = [
  { value: 'gpt-image-2', label: 'gpt-image-2' },
  { value: 'gpt-image-1.5', label: 'gpt-image-1.5' },
  { value: 'gpt-image-1', label: 'gpt-image-1' }
]

const gptImage2Sizes: ImageSizeOption[] = [
  { value: 'auto', label: '自动', tier: 'auto' },
  { value: '1024x1024', label: '1:1 · 1024x1024', tier: '1K' },
  { value: '1536x1024', label: '3:2 · 1536x1024', tier: '2K' },
  { value: '1024x1536', label: '2:3 · 1024x1536', tier: '2K' },
  { value: '2048x2048', label: '1:1 · 2048x2048', tier: '2K' },
  { value: '2048x1152', label: '16:9 · 2048x1152', tier: '2K' },
  { value: '1152x2048', label: '9:16 · 1152x2048', tier: '2K' },
  { value: '3840x2160', label: '16:9 · 3840x2160', tier: '4K' },
  { value: '2160x3840', label: '9:16 · 2160x3840', tier: '4K' }
]

const legacyGptImageSizes: ImageSizeOption[] = [
  { value: 'auto', label: '自动', tier: 'auto' },
  { value: '1024x1024', label: '1:1 · 1024x1024', tier: '1K' },
  { value: '1536x1024', label: '3:2 · 1536x1024', tier: '2K' },
  { value: '1024x1536', label: '2:3 · 1024x1536', tier: '2K' }
]

export const imageModelCapabilities: Record<string, { sizes: ImageSizeOption[] }> = {
  'gpt-image-2': { sizes: gptImage2Sizes },
  'gpt-image-1.5': { sizes: legacyGptImageSizes },
  'gpt-image-1': { sizes: legacyGptImageSizes }
}

export function getImageSizeOptions(model: string): ImageSizeOption[] {
  return imageModelCapabilities[model]?.sizes ?? legacyGptImageSizes
}
