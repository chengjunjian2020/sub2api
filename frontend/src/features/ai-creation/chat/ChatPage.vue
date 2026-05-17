<template>
  <AiCreationShell>
    <div class="grid h-full min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card dark:border-dark-700 dark:bg-dark-900 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside class="flex min-h-0 flex-col border-b border-gray-200 bg-gray-50/70 dark:border-dark-700 dark:bg-dark-950/60 xl:border-b-0 xl:border-r">
        <div class="border-b border-gray-200 p-3 dark:border-dark-700">
          <button class="btn btn-primary btn-md w-full justify-center" type="button" @click="createSessionAndFocus">
            <Icon name="plus" size="sm" />
            新建对话
          </button>
          <input
            v-model="sessionQuery"
            class="input mt-3"
            name="ai-creation-session-search"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            placeholder="搜索历史..."
          />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <button
            v-for="session in filteredSessions"
            :key="session.id"
            type="button"
            class="group flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
            :class="activeSessionId === session.id
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
              : 'text-gray-700 hover:bg-white dark:text-dark-300 dark:hover:bg-dark-800'"
            @click="selectSession(session.id)"
          >
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">{{ session.title }}</span>
              <span class="mt-1 block text-xs text-gray-400">{{ formatTime(session.lastTouchedAt) }} · {{ session.messageCount }} 条</span>
            </span>
            <span
              class="rounded-lg p-1 text-gray-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-900/20"
              @click.stop="removeSession(session.id)"
            >
              <Icon name="trash" size="sm" />
            </span>
          </button>

          <div v-if="filteredSessions.length === 0" class="px-3 py-10 text-center text-sm text-gray-500 dark:text-dark-400">
            暂无会话
          </div>
        </div>

        <p class="border-t border-gray-200 px-3 py-2 text-xs text-gray-400 dark:border-dark-700">
          仅显示最近 100 条历史。
        </p>
      </aside>

      <section class="flex min-h-0 flex-col bg-white dark:bg-dark-900">
        <div class="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-dark-700 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <h2 class="truncate text-base font-semibold text-gray-900 dark:text-white">{{ activeSession?.title || 'AI 对话' }}</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">对话、文件和联网搜索测试。</p>
          </div>
          <div class="grid gap-2 sm:grid-cols-[180px_minmax(220px,1fr)_auto] sm:items-center lg:min-w-[620px]">
            <Select v-model="settings.chatModel.value" :options="chatModelOptions" :searchable="false" />
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
            <button class="btn btn-secondary btn-sm" type="button" @click="copyConversation">
              <Icon name="copy" size="sm" />
              复制
            </button>
          </div>
        </div>

        <Conversation class="min-h-0 flex-1 bg-white dark:bg-dark-900">
          <ConversationContent class="mx-auto w-full max-w-4xl">
            <ConversationEmptyState
              v-if="messages.length === 0"
              title="开始一次测试对话"
              description="输入提示词后会保存到当前浏览器，可在左侧删除历史。"
            >
              <template #icon>
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                  <Icon name="chat" size="xl" />
                </div>
              </template>
            </ConversationEmptyState>

            <Message v-for="message in messages" :key="message.id" :from="message.role">
              <MessageContent>
                <div class="flex items-center justify-between gap-3 text-xs text-gray-400">
                  <span>{{ message.role === 'user' ? '你' : 'AI' }} · {{ formatTime(message.createdAt) }}</span>
                  <MessageActions>
                    <MessageAction tooltip="复制消息" @click="copyText(message.content)">
                      <Icon name="copy" size="xs" />
                    </MessageAction>
                  </MessageActions>
                </div>

                <MessageResponse :content="message.content || (message.status === 'streaming' ? '正在思考...' : '')" />

                <div v-if="message.attachments?.length" class="mt-1 flex flex-wrap gap-2">
                  <span
                    v-for="attachment in message.attachments"
                    :key="attachment.id"
                    class="rounded-lg bg-white/70 px-2 py-1 text-xs text-gray-600 dark:bg-dark-900/60 dark:text-dark-300"
                  >
                    {{ attachment.name }}
                  </span>
                </div>
                <p v-if="message.error" class="mt-2 text-xs text-red-500">{{ message.error }}</p>
              </MessageContent>
            </Message>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div class="border-t border-gray-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-900">
          <div v-if="errorMessage" class="mx-auto mb-3 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {{ errorMessage }}
          </div>

          <PromptInput
            class="mx-auto max-w-4xl"
            accept="image/*,.txt,.md,.json,.csv,.log,text/*"
            multiple
            :max-files="8"
            :max-file-size="12 * 1024 * 1024"
            @submit="handlePromptSubmit"
            @error="handlePromptError"
          >
            <PromptInputAttachments />
            <PromptInputTextarea
              name="ai-creation-chat-message"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              :spellcheck="false"
              placeholder="给 AI 发送消息..."
              :disabled="streaming"
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputAttachmentButton label="附件" icon-only />
                <PromptInputButton
                  label="联网搜索"
                  :aria-pressed="webSearch"
                  :class="[
                    'h-9 w-9 px-0',
                    webSearch
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-300'
                      : ''
                  ]"
                  @click="webSearch = !webSearch"
                >
                  <Icon name="globe" size="sm" />
                </PromptInputButton>
                <label class="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400">
                  <Toggle v-model="settings.rememberKey.value" />
                  记住 Key
                </label>
              </PromptInputTools>
              <div class="flex justify-end gap-2">
                <button v-if="streaming" class="btn btn-secondary btn-md" type="button" @click="stopStreaming">
                  停止
                </button>
                <PromptInputSubmit :status="promptStatus" :disabled="!settings.hasApiKey.value || streaming" />
              </div>
            </PromptInputFooter>
          </PromptInput>

          <p class="mx-auto mt-2 max-w-4xl text-xs leading-relaxed text-gray-400">
            仅用于接口测试，记录只保存在当前浏览器，可随时删除。
          </p>
        </div>
      </section>
    </div>
  </AiCreationShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiCreationShell from '../AiCreationShell.vue'
import Icon from '@/components/icons/Icon.vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import Toggle from '@/components/common/Toggle.vue'
import { chatModelOptions } from '../config/models'
import { streamChatCompletion } from '../api/aiClient'
import { useAiSettings } from '../composables/useAiSettings'
import {
  createId,
  deleteChatSession,
  listChatMessages,
  listChatSessions,
  saveChatMessage,
  saveChatSession
} from '../storage/db'
import type { AiChatAttachment, AiChatMessage, AiChatSession } from '../types'
import type { PromptInputMessage, PromptInputStatus } from '../components/ai-elements'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
  PromptInput,
  PromptInputAttachmentButton,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from '../components/ai-elements'

const route = useRoute()
const router = useRouter()
const settings = useAiSettings()

const sessions = ref<AiChatSession[]>([])
const activeSessionId = ref<string | null>(null)
const messages = ref<AiChatMessage[]>([])
const sessionQuery = ref('')
const webSearch = ref(false)
const streaming = ref(false)
const errorMessage = ref('')
let abortController: AbortController | null = null

const activeSession = computed(() => sessions.value.find((session) => session.id === activeSessionId.value) || null)
const filteredSessions = computed(() => {
  const query = sessionQuery.value.trim().toLowerCase()
  if (!query) return sessions.value
  return sessions.value.filter((session) => session.title.toLowerCase().includes(query))
})
const promptStatus = computed<PromptInputStatus>(() => streaming.value ? 'streaming' : 'ready')

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(ts))
}

async function refreshSessions() {
  sessions.value = await listChatSessions()
}

async function selectSession(id: string) {
  activeSessionId.value = id
  messages.value = await listChatMessages(id)
}

async function createSession(title = '新会话') {
  const now = Date.now()
  const session: AiChatSession = {
    id: createId('chat'),
    title,
    model: settings.chatModel.value,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
    lastTouchedAt: now
  }
  await saveChatSession(session)
  await refreshSessions()
  await selectSession(session.id)
  return session
}

async function createSessionAndFocus() {
  await createSession()
  await nextTick()
}

async function removeSession(id: string) {
  await deleteChatSession(id)
  await refreshSessions()
  if (activeSessionId.value === id) {
    const nextSession = sessions.value[0]
    if (nextSession) await selectSession(nextSession.id)
    else {
      activeSessionId.value = null
      messages.value = []
    }
  }
}

async function ensureActiveSession(titleSeed: string) {
  if (activeSession.value) return activeSession.value
  return createSession(titleFromPrompt(titleSeed))
}

function titleFromPrompt(content: string) {
  const title = content.trim().replace(/\s+/g, ' ').slice(0, 28)
  return title || '新会话'
}

async function updateActiveSessionAfterMessage(title?: string) {
  const session = activeSession.value
  if (!session) return
  const now = Date.now()
  session.updatedAt = now
  session.lastTouchedAt = now
  session.model = settings.chatModel.value
  session.messageCount = messages.value.length
  if (title && (session.title === '新会话' || session.messageCount <= 2)) {
    session.title = title
  }
  await saveChatSession({ ...session })
  await refreshSessions()
}

async function handlePromptSubmit(payload: PromptInputMessage) {
  if (streaming.value) return
  if (!settings.hasApiKey.value) {
    errorMessage.value = '请先填写 API Key'
    return
  }

  const content = payload.text.trim()
  const attachments = await Promise.all(payload.files.map(readPromptAttachment))
  if (!content && attachments.length === 0) return

  errorMessage.value = ''
  const session = await ensureActiveSession(content)
  const now = Date.now()
  const userMessage: AiChatMessage = {
    id: createId('msg'),
    sessionId: session.id,
    role: 'user',
    content,
    attachments,
    status: 'done',
    createdAt: now,
    updatedAt: now,
    lastTouchedAt: now
  }
  const assistantMessage: AiChatMessage = {
    id: createId('msg'),
    sessionId: session.id,
    role: 'assistant',
    content: '',
    status: 'streaming',
    createdAt: now + 1,
    updatedAt: now + 1,
    lastTouchedAt: now + 1
  }

  messages.value = [...messages.value, userMessage, assistantMessage]
  await Promise.all([saveChatMessage(userMessage), saveChatMessage(assistantMessage)])
  await updateActiveSessionAfterMessage(titleFromPrompt(userMessage.content))

  streaming.value = true
  abortController = new AbortController()
  let lastPersist = 0

  try {
    await streamChatCompletion({
      apiKey: settings.apiKey.value.trim(),
      model: settings.chatModel.value,
      messages: messages.value.filter((message) => message.id !== assistantMessage.id),
      webSearch: webSearch.value,
      signal: abortController.signal,
      onDelta: (text) => {
        assistantMessage.content += text
        assistantMessage.updatedAt = Date.now()
        assistantMessage.lastTouchedAt = assistantMessage.updatedAt
        messages.value = messages.value.map((message) =>
          message.id === assistantMessage.id ? { ...assistantMessage } : message
        )
        if (Date.now() - lastPersist > 800) {
          lastPersist = Date.now()
          saveChatMessage({ ...assistantMessage }).catch(console.error)
        }
      }
    })
    assistantMessage.status = 'done'
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      assistantMessage.status = 'done'
    } else {
      assistantMessage.status = 'error'
      assistantMessage.error = (error as Error).message || '请求失败'
      errorMessage.value = assistantMessage.error
    }
  } finally {
    streaming.value = false
    abortController = null
    assistantMessage.updatedAt = Date.now()
    assistantMessage.lastTouchedAt = assistantMessage.updatedAt
    messages.value = messages.value.map((message) =>
      message.id === assistantMessage.id ? { ...assistantMessage } : message
    )
    await saveChatMessage({ ...assistantMessage })
    await updateActiveSessionAfterMessage()
  }
}

function handlePromptError(error: { message: string }) {
  errorMessage.value = error.message
}

async function readPromptAttachment(filePart: PromptInputMessage['files'][number]): Promise<AiChatAttachment> {
  const file = filePart.file
  const type = filePart.mediaType || file?.type || 'application/octet-stream'
  const name = filePart.filename || file?.name || 'attachment'
  const base = {
    id: createId('att'),
    name,
    type,
    size: file?.size || 0
  }

  if (type.startsWith('image/') && filePart.url.startsWith('data:')) {
    return { ...base, dataUrl: filePart.url }
  }
  if (file && (type.startsWith('text/') || /\.(md|json|csv|log|txt)$/i.test(name))) {
    return { ...base, text: (await file.text()).slice(0, 200_000) }
  }
  return base
}

function stopStreaming() {
  abortController?.abort()
}

async function copyText(text: string) {
  await navigator.clipboard?.writeText(text)
}

async function copyConversation() {
  const text = messages.value
    .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}:\n${message.content}`)
    .join('\n\n')
  await copyText(text)
}

onMounted(async () => {
  await settings.initialize(route, router)
  await refreshSessions()
  if (sessions.value[0]) {
    await selectSession(sessions.value[0].id)
  }
})
</script>
