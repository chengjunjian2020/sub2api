import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_IMAGE_MODEL
} from '../config/models'
import type {
  AiChatMessage,
  AiChatSession,
  AiCreationSettingsRecord,
  AiImageJob
} from '../types'

const DB_NAME = 'sub2api-ai-creation'
const DB_VERSION = 1
const SETTINGS_VERSION = 2
const MAX_RENDERED_HISTORY = 100
const STORAGE_DELETE_THRESHOLD = 0.9
const STORAGE_TARGET_THRESHOLD = 0.85

type StoreName = 'sessions' | 'messages' | 'imageJobs' | 'settings'
type CleanupCandidate = {
  kind: 'session' | 'imageJob'
  id: string
  lastTouchedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
    tx.onerror = () => reject(tx.error)
  })
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('lastTouchedAt', 'lastTouchedAt')
      }
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', { keyPath: 'id' })
        store.createIndex('sessionId', 'sessionId')
        store.createIndex('lastTouchedAt', 'lastTouchedAt')
      }
      if (!db.objectStoreNames.contains('imageJobs')) {
        const store = db.createObjectStore('imageJobs', { keyPath: 'id' })
        store.createIndex('lastTouchedAt', 'lastTouchedAt')
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDb()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise<T[]>(tx.objectStore(storeName).getAll())
}

async function putRecord<T>(storeName: StoreName, record: T): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).put(record)
  await transactionDone(tx)
}

async function deleteRecord(storeName: StoreName, id: IDBValidKey): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).delete(id)
  await transactionDone(tx)
}

function touch<T extends { createdAt: number; updatedAt: number; lastTouchedAt: number }>(record: T): T {
  record.lastTouchedAt = record.updatedAt || record.createdAt
  return record
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export async function loadAiSettings(): Promise<AiCreationSettingsRecord> {
  const db = await openDb()
  const tx = db.transaction('settings', 'readonly')
  const record = await requestToPromise<AiCreationSettingsRecord | undefined>(
    tx.objectStore('settings').get('local')
  )
  if (record) {
    return {
      ...record,
      settingsVersion: SETTINGS_VERSION,
      rememberKey: record.settingsVersion ? record.rememberKey : true
    }
  }

  const now = Date.now()
  return {
    id: 'local',
    settingsVersion: SETTINGS_VERSION,
    apiKey: '',
    rememberKey: true,
    chatModel: DEFAULT_CHAT_MODEL,
    imageModel: DEFAULT_IMAGE_MODEL,
    createdAt: now,
    updatedAt: now
  }
}

export async function saveAiSettings(settings: AiCreationSettingsRecord): Promise<void> {
  await putRecord('settings', {
    ...settings,
    settingsVersion: SETTINGS_VERSION,
    apiKey: settings.rememberKey ? settings.apiKey : '',
    updatedAt: Date.now()
  })
}

export async function listChatSessions(limit = MAX_RENDERED_HISTORY): Promise<AiChatSession[]> {
  const sessions = await getAll<AiChatSession>('sessions')
  return sessions
    .map(touch)
    .sort((a, b) => b.lastTouchedAt - a.lastTouchedAt)
    .slice(0, limit)
}

export async function getChatSession(id: string): Promise<AiChatSession | null> {
  const db = await openDb()
  const tx = db.transaction('sessions', 'readonly')
  const session = await requestToPromise<AiChatSession | undefined>(tx.objectStore('sessions').get(id))
  return session ? touch(session) : null
}

export async function saveChatSession(session: AiChatSession): Promise<void> {
  await putRecord('sessions', touch(session))
  await enforceAiCreationLimits()
}

export async function deleteChatSession(id: string): Promise<void> {
  const db = await openDb()
  const readTx = db.transaction('messages', 'readonly')
  const keys = await requestToPromise<IDBValidKey[]>(
    readTx.objectStore('messages').index('sessionId').getAllKeys(IDBKeyRange.only(id))
  )

  const writeTx = db.transaction(['sessions', 'messages'], 'readwrite')
  const messageStore = writeTx.objectStore('messages')
  keys.forEach((key) => messageStore.delete(key))
  writeTx.objectStore('sessions').delete(id)
  await transactionDone(writeTx)
}

export async function listChatMessages(sessionId: string): Promise<AiChatMessage[]> {
  const db = await openDb()
  const tx = db.transaction('messages', 'readonly')
  const messages = await requestToPromise<AiChatMessage[]>(
    tx.objectStore('messages').index('sessionId').getAll(IDBKeyRange.only(sessionId))
  )
  return messages.map(touch).sort((a, b) => a.createdAt - b.createdAt)
}

export async function saveChatMessage(message: AiChatMessage): Promise<void> {
  await putRecord('messages', touch(message))
}

export async function deleteChatMessage(id: string): Promise<void> {
  await deleteRecord('messages', id)
}

export async function listImageJobs(limit = MAX_RENDERED_HISTORY): Promise<AiImageJob[]> {
  const jobs = await getAll<AiImageJob>('imageJobs')
  return jobs
    .map(touch)
    .sort((a, b) => b.lastTouchedAt - a.lastTouchedAt)
    .slice(0, limit)
}

export async function saveImageJob(job: AiImageJob): Promise<void> {
  await putRecord('imageJobs', touch(job))
  await enforceAiCreationLimits()
}

export async function deleteImageJob(id: string): Promise<void> {
  await deleteRecord('imageJobs', id)
}

export async function enforceAiCreationLimits(): Promise<void> {
  await enforceStoreLimit('sessions', 'session')
  await enforceStoreLimit('imageJobs', 'imageJob')
  await enforceStorageQuota()
}

async function enforceStoreLimit(storeName: 'sessions' | 'imageJobs', kind: CleanupCandidate['kind']) {
  const items = await getAll<AiChatSession | AiImageJob>(storeName)
  if (items.length <= MAX_RENDERED_HISTORY) return

  const extra = items
    .map(touch)
    .sort((a, b) => a.lastTouchedAt - b.lastTouchedAt)
    .slice(0, items.length - MAX_RENDERED_HISTORY)

  for (const item of extra) {
    if (kind === 'session') await deleteChatSession(item.id)
    else await deleteImageJob(item.id)
  }
}

async function enforceStorageQuota() {
  if (!navigator.storage?.estimate) return
  const estimate = await navigator.storage.estimate()
  if (!estimate.quota || !estimate.usage) return
  if (estimate.usage / estimate.quota < STORAGE_DELETE_THRESHOLD) return

  const candidates = await getCleanupCandidates()
  for (const candidate of candidates) {
    if (candidate.kind === 'session') {
      await deleteChatSession(candidate.id)
    } else {
      await deleteImageJob(candidate.id)
    }

    const nextEstimate = await navigator.storage.estimate()
    if (!nextEstimate.quota || !nextEstimate.usage) return
    if (nextEstimate.usage / nextEstimate.quota <= STORAGE_TARGET_THRESHOLD) return
  }
}

async function getCleanupCandidates(): Promise<CleanupCandidate[]> {
  const [sessions, imageJobs] = await Promise.all([
    getAll<AiChatSession>('sessions'),
    getAll<AiImageJob>('imageJobs')
  ])

  return [
    ...sessions.map((item) => ({
      kind: 'session' as const,
      id: item.id,
      lastTouchedAt: item.updatedAt || item.createdAt
    })),
    ...imageJobs.map((item) => ({
      kind: 'imageJob' as const,
      id: item.id,
      lastTouchedAt: item.updatedAt || item.createdAt
    }))
  ].sort((a, b) => a.lastTouchedAt - b.lastTouchedAt)
}

export { MAX_RENDERED_HISTORY }
