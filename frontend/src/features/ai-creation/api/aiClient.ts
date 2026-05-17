import type { AiChatAttachment, AiChatMessage } from '../types'

type ChatAPIContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

interface ChatAPIMessage {
  role: 'user' | 'assistant' | 'system'
  content: ChatAPIContent
}

interface StreamChatInput {
  apiKey: string
  model: string
  messages: AiChatMessage[]
  webSearch: boolean
  signal: AbortSignal
  onDelta: (text: string) => void
}

interface GenerateImageInput {
  apiKey: string
  model: string
  prompt: string
  size: string
  quality: string
  outputFormat: string
  background: string
  referenceImages: string[]
  signal?: AbortSignal
  onPartialImage?: (result: GenerateImageStreamResult) => void
}

interface GenerateImageResult {
  imageUrl: string
  imageBase64?: string
  mediaType?: string
  revisedPrompt?: string
}

interface GenerateImageStreamResult extends GenerateImageResult {
  partialImageIndex?: number
}

async function parseErrorResponse(response: Response): Promise<string> {
  const fallback = `${response.status} ${response.statusText}`.trim()
  try {
    const data = await response.json()
    return data?.error?.message || data?.message || data?.detail || fallback
  } catch {
    return fallback
  }
}

function attachmentToContentParts(attachment: AiChatAttachment) {
  if (attachment.dataUrl && attachment.type.startsWith('image/')) {
    return [{ type: 'image_url' as const, image_url: { url: attachment.dataUrl } }]
  }
  if (attachment.text) {
    return [{ type: 'text' as const, text: `\n\n[${attachment.name}]\n${attachment.text}` }]
  }
  return [{ type: 'text' as const, text: `\n\n[已上传文件: ${attachment.name}]` }]
}

function toChatAPIMessages(messages: AiChatMessage[]): ChatAPIMessage[] {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant' || message.role === 'system')
    .map((message) => {
      const attachments = message.attachments ?? []
      if (message.role !== 'user' || attachments.length === 0) {
        return {
          role: message.role,
          content: message.content
        }
      }

      const contentParts: Exclude<ChatAPIContent, string> = [
        { type: 'text', text: message.content || '请阅读附件内容。' }
      ]
      attachments.forEach((attachment) => {
        contentParts.push(...attachmentToContentParts(attachment))
      })
      return {
        role: message.role,
        content: contentParts
      }
    })
}

export async function streamChatCompletion(input: StreamChatInput): Promise<void> {
  const body: Record<string, unknown> = {
    model: input.model,
    stream: true,
    messages: toChatAPIMessages(input.messages)
  }

  if (input.webSearch) {
    body.tools = [{ type: 'web_search_preview' }]
  }

  const response = await fetch('/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: input.signal
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }
  if (!response.body) {
    throw new Error('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') return

      try {
        const chunk = JSON.parse(payload)
        const delta = chunk?.choices?.[0]?.delta?.content
          ?? chunk?.choices?.[0]?.message?.content
          ?? ''
        if (typeof delta === 'string' && delta) {
          input.onDelta(delta)
        }
      } catch {
        // Ignore malformed keep-alive chunks.
      }
    }
  }
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const hasReferences = input.referenceImages.length > 0
  const response = await fetch(hasReferences ? '/v1/images/edits' : '/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      size: input.size,
      quality: input.quality,
      output_format: input.outputFormat,
      background: input.background,
      response_format: 'b64_json',
      stream: true,
      partial_images: 1,
      ...(hasReferences
        ? { images: input.referenceImages.map((imageUrl) => ({ image_url: imageUrl })) }
        : { n: 1 })
    }),
    signal: input.signal
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text/event-stream')) {
    return readImageStream(response, input.outputFormat, input.onPartialImage)
  }

  const data = await response.json()
  const image = extractImageResult(data, input.outputFormat)
  const imageUrl = image.imageUrl
  if (!imageUrl) {
    throw new Error('接口未返回图片数据')
  }

  return {
    imageUrl,
    imageBase64: image.imageBase64,
    mediaType: image.mediaType,
    revisedPrompt: data?.data?.[0]?.revised_prompt
  }
}

async function readImageStream(
  response: Response,
  outputFormat: string,
  onPartialImage?: (result: GenerateImageStreamResult) => void
): Promise<GenerateImageResult> {
  if (!response.body) {
    throw new Error('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const streamState: {
    finalImage: GenerateImageResult | null
    lastImage: GenerateImageResult | null
  } = {
    finalImage: null,
    lastImage: null
  }

  const handleBlock = (block: string): boolean => {
    const event = parseSseBlock(block)
    if (!event) return false
    if (event.data === '[DONE]') return true

    let payload: unknown
    try {
      payload = JSON.parse(event.data)
    } catch {
      return false
    }

    const payloadType = getPayloadType(payload)
    const eventName = event.name || payloadType
    const errorMessage = getImageStreamError(payload, eventName)
    if (errorMessage) {
      throw new Error(errorMessage)
    }

    const image = extractImageStreamResult(payload, outputFormat)
    if (!image.imageUrl) return false

    streamState.lastImage = image
    const isPartial = eventName.includes('partial_image') || payloadType.includes('partial_image')
    if (isPartial) {
      onPartialImage?.(image)
      return false
    }

    const isCompleted = eventName.includes('completed') || payloadType.includes('completed')
    if (isCompleted || !eventName) {
      streamState.finalImage = image
      return true
    }

    return false
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      if (handleBlock(block)) {
        const image = streamState.finalImage ?? streamState.lastImage
        if (!image?.imageUrl) throw new Error('接口未返回图片数据')
        return image
      }
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    handleBlock(buffer)
  }

  const image = streamState.finalImage ?? streamState.lastImage
  if (!image?.imageUrl) {
    throw new Error('接口未返回图片数据')
  }

  return image
}

function parseSseBlock(block: string): { name: string; data: string } | null {
  const dataLines: string[] = []
  let name = ''

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) {
      name = line.slice(6).trim()
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) return null
  return { name, data: dataLines.join('\n') }
}

function getPayloadType(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const type = (payload as { type?: unknown }).type
  return typeof type === 'string' ? type : ''
}

function getImageStreamError(payload: unknown, eventName: string): string {
  if (!payload || typeof payload !== 'object') return ''
  const json = payload as {
    error?: { message?: string } | string
    message?: string
    response?: { error?: { message?: string } }
  }
  if (eventName === 'error' || eventName.endsWith('.failed') || json.error) {
    if (typeof json.error === 'string') return json.error
    return json.error?.message || json.response?.error?.message || json.message || '生成失败'
  }
  return ''
}

function extractImageStreamResult(data: unknown, outputFormat: string): GenerateImageStreamResult {
  const json = data as {
    b64_json?: string
    partial_image_b64?: string
    result?: string
    url?: string
    output_format?: string
    revised_prompt?: string
    partial_image_index?: number
  }
  const format = normalizeImageFormat(json.output_format || outputFormat)

  if (json.url) {
    return {
      imageUrl: json.url,
      revisedPrompt: json.revised_prompt,
      partialImageIndex: json.partial_image_index
    }
  }

  const base64 = json.b64_json || json.partial_image_b64 || json.result
  if (base64) {
    const mediaType = `image/${format}`
    return {
      imageUrl: `data:${mediaType};base64,${base64}`,
      imageBase64: base64,
      mediaType,
      revisedPrompt: json.revised_prompt,
      partialImageIndex: json.partial_image_index
    }
  }

  const image = extractImageResult(data, outputFormat)
  return {
    ...image,
    revisedPrompt: json.revised_prompt,
    partialImageIndex: json.partial_image_index
  }
}

function extractImageResult(data: unknown, outputFormat: string): {
  imageUrl: string
  imageBase64?: string
  mediaType?: string
} {
  const json = data as {
    data?: Array<{ b64_json?: string; url?: string }>
    output?: Array<{ type?: string; result?: string; output_format?: string }>
  }

  const item = json.data?.[0]
  if (item?.url) return { imageUrl: item.url }
  if (item?.b64_json) {
    const mediaType = `image/${normalizeImageFormat(outputFormat)}`
    return {
      imageUrl: `data:${mediaType};base64,${item.b64_json}`,
      imageBase64: item.b64_json,
      mediaType
    }
  }

  const outputImage = json.output?.find((part) => part.type === 'image_generation_call' && part.result)
  if (outputImage?.result) {
    const format = normalizeImageFormat(outputImage.output_format || outputFormat)
    const mediaType = `image/${format}`
    return {
      imageUrl: `data:${mediaType};base64,${outputImage.result}`,
      imageBase64: outputImage.result,
      mediaType
    }
  }

  return { imageUrl: '' }
}

function normalizeImageFormat(format: string): string {
  const normalized = (format || 'png').toLowerCase()
  return normalized === 'jpg' ? 'jpeg' : normalized
}
