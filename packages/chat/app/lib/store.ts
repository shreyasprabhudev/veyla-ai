import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
  processed?: boolean
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
  model: string
  created: number
  updated: number
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isOffline: boolean
  modelPreference: 'local' | 'cloud'
  addConversation: (conversation: Conversation) => void
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, update: Partial<Message>) => void
  setOfflineMode: (offline: boolean) => void
  setModelPreference: (preference: 'local' | 'cloud') => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      isOffline: false,
      modelPreference: 'cloud',

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: conversation.id,
        })),

      setActiveConversation: (id) =>
        set(() => ({
          activeConversationId: id,
        })),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updated: Date.now(),
                }
              : conv
          ),
        })),

      updateMessage: (conversationId, messageId, update) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...update } : msg
                  ),
                  updated: Date.now(),
                }
              : conv
          ),
        })),

      setOfflineMode: (offline) =>
        set(() => ({
          isOffline: offline,
        })),

      setModelPreference: (preference) =>
        set(() => ({
          modelPreference: preference,
        })),
    }),
    {
      name: 'veyla-chat-store',
    }
  )
)
