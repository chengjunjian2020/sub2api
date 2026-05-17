import { computed, ref, watch } from 'vue'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { DEFAULT_CHAT_MODEL, DEFAULT_IMAGE_MODEL } from '../config/models'
import { loadAiSettings, saveAiSettings } from '../storage/db'
import type { AiCreationSettingsRecord } from '../types'

const SESSION_KEY = 'sub2api_ai_creation_api_key'

const loaded = ref(false)
const loading = ref(false)
const apiKey = ref(sessionStorage.getItem(SESSION_KEY) || '')
const rememberKey = ref(true)
const chatModel = ref(DEFAULT_CHAT_MODEL)
const imageModel = ref(DEFAULT_IMAGE_MODEL)

let initPromise: Promise<void> | null = null
let watchStarted = false

function toRecord(): AiCreationSettingsRecord {
  const now = Date.now()
  return {
    id: 'local',
    settingsVersion: 2,
    apiKey: apiKey.value,
    rememberKey: rememberKey.value,
    chatModel: chatModel.value,
    imageModel: imageModel.value,
    createdAt: now,
    updatedAt: now
  }
}

async function persist() {
  sessionStorage.setItem(SESSION_KEY, apiKey.value)
  await saveAiSettings(toRecord())
}

export function useAiSettings() {
  if (!watchStarted) {
    watchStarted = true
    watch([apiKey, rememberKey, chatModel, imageModel], () => {
      if (!loaded.value) return
      persist().catch((error) => {
        console.error('Failed to persist AI creation settings:', error)
      })
    })
  }

  async function initialize(route?: RouteLocationNormalizedLoaded, router?: Router) {
    if (!initPromise) {
      loading.value = true
      initPromise = loadAiSettings()
        .then((settings) => {
          rememberKey.value = settings.rememberKey
          chatModel.value = settings.chatModel || DEFAULT_CHAT_MODEL
          imageModel.value = settings.imageModel || DEFAULT_IMAGE_MODEL
          if (!apiKey.value && settings.rememberKey && settings.apiKey) {
            apiKey.value = settings.apiKey
          }
          loaded.value = true
        })
        .finally(() => {
          loading.value = false
        })
    }

    await initPromise
    consumeKeyFromRoute(route, router)
  }

  function consumeKeyFromRoute(route?: RouteLocationNormalizedLoaded, router?: Router) {
    const queryKey = route?.query.key
    const incomingKey = Array.isArray(queryKey) ? queryKey[0] : queryKey
    if (!incomingKey || typeof incomingKey !== 'string') return

    apiKey.value = incomingKey
    sessionStorage.setItem(SESSION_KEY, incomingKey)

    if (router && route) {
      const nextQuery = { ...route.query }
      delete nextQuery.key
      router.replace({ path: route.path, query: nextQuery })
    }
  }

  return {
    apiKey,
    rememberKey,
    chatModel,
    imageModel,
    hasApiKey: computed(() => apiKey.value.trim().length > 0),
    loading,
    loaded,
    initialize,
    consumeKeyFromRoute
  }
}
