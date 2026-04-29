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
    sendMessage: (channelId: string, content: string, authorId: string, authorName: string) => void
}

const mockMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1', channelId: '1', authorId: 'u1', authorName: 'Алексей', content: 'Всем привет! Когда стрим?', createdAt: new Date('2026-04-20T14:23:00') },
        { id: 'm2', channelId: '1', authorId: 'u2', authorName: 'Мария', content: 'В 20:00 по Москве', createdAt: new Date('2026-04-20T14:25:00') },
        { id: 'm3', channelId: '1', authorId: 'u3', authorName: 'Дмитрий', content: 'Запилил новый мем в #memes', createdAt: new Date('2026-04-20T14:28:00') },
    ],
}

export const useChatStore = create<ChatState>((set) => ({
    messages: mockMessages,

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