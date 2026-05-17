import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface ConversationContext {
  isAtBottom: Ref<boolean>
  scrollToBottom: () => void
}

export const ConversationKey: InjectionKey<ConversationContext> = Symbol('Conversation')

export function useConversationContext(): ConversationContext {
  const context = inject(ConversationKey)
  if (!context) {
    throw new Error('ConversationScrollButton must be used inside Conversation')
  }
  return context
}
