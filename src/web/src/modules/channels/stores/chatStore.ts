import { create } from 'zustand'

export interface Message {
    id: string
    channelId: string
    authorId: string
    authorName: string
    authorAvatar?: string
    content: string
    createdAt: Date
}

interface ChatState {
    messages: Record<string, Message[]>
    loading: boolean
    sendMessage: (channelId: string, content: string, authorId: string, authorName: string) => void
    fetchMessages: (channelId: string) => void
}

// Мок-сообщения для разных каналов
const mockMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1', channelId: '1', authorId: 'u1', authorName: 'Алексей', content: 'Всем привет! Когда стрим?', createdAt: new Date('2026-04-20T14:23:00') },
        { id: 'm2', channelId: '1', authorId: 'u2', authorName: 'Мария', content: 'В 20:00 по Москве', createdAt: new Date('2026-04-20T14:25:00') },
        { id: 'm3', channelId: '1', authorId: 'u3', authorName: 'Дмитрий', content: 'Отлично, буду!', createdAt: new Date('2026-04-20T14:28:00') },
        { id: 'm4', channelId: '1', authorId: 'u1', authorName: 'Алексей', content: 'Кстати, кто в Valorant сегодня?', createdAt: new Date('2026-04-20T15:30:00') },
    ],
    '2': [
        { id: 'm5', channelId: '2', authorId: 'u1', authorName: 'Алексей', content: 'Ребята, кто хочет катку?', createdAt: new Date('2026-04-20T16:00:00') },
        { id: 'm6', channelId: '2', authorId: 'u4', authorName: 'Сергей', content: 'Я в деле!', createdAt: new Date('2026-04-20T16:05:00') },
    ],
    '3': [
        { id: 'm7', channelId: '3', authorId: 'u2', authorName: 'Мария', content: 'Among Us сегодня в 21:00?', createdAt: new Date('2026-04-20T17:00:00') },
    ],
    '6': [
        { id: 'm8', channelId: '6', authorId: 'u5', authorName: 'Иван', content: 'Кто делает код-ревью?', createdAt: new Date('2026-04-20T10:00:00') },
    ],
    '7': [
        { id: 'm9', channelId: '7', authorId: 'u6', authorName: 'Петр', content: 'PR #42 готов к ревью', createdAt: new Date('2026-04-20T11:00:00') },
    ],
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: mockMessages,
    loading: false,

    fetchMessages: (channelId: string) => {
        set({ loading: true })
        // Симуляция загрузки
        setTimeout(() => {
            const existingMessages = get().messages[channelId] || []
            set({
                messages: { ...get().messages, [channelId]: existingMessages },
                loading: false
            })
        }, 100)
    },

    sendMessage: (channelId: string, content: string, authorId: string, authorName: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            channelId,
            authorId,
            authorName,
            content,
            createdAt: new Date(),
        }
        set((state) => ({
            messages: {
                ...state.messages,
                [channelId]: [...(state.messages[channelId] || []), newMessage],
            },
        }))
    },
}))