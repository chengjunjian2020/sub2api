export type AiRole = 'user' | 'assistant' | 'system'

export interface AiChatAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl?: string
  text?: string
}

export interface AiChatMessage {
  id: string
  sessionId: string
  role: AiRole
  content: string
  attachments?: AiChatAttachment[]
  status?: 'pending' | 'streaming' | 'done' | 'error'
  error?: string
  createdAt: number
  updatedAt: number
  lastTouchedAt: number
}

export interface AiChatSession {
  id: string
  title: string
  model: string
  messageCount: number
  createdAt: number
  updatedAt: number
  lastTouchedAt: number
}

export interface AiImageJob {
  id: string
  prompt: string
  model: string
  size: string
  quality: string
  outputFormat: string
  background: string
  status: 'pending' | 'done' | 'error'
  imageUrl?: string
  imageBase64?: string
  mediaType?: string
  revisedPrompt?: string
  error?: string
  createdAt: number
  updatedAt: number
  lastTouchedAt: number
}

export interface AiCreationSettingsRecord {
  id: 'local'
  settingsVersion?: number
  apiKey: string
  rememberKey: boolean
  chatModel: string
  imageModel: string
  createdAt: number
  updatedAt: number
}

export interface ImageSizeOption {
  value: string
  label: string
  tier: 'auto' | '1K' | '2K' | '4K'
}
