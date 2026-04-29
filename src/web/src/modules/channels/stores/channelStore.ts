import { create } from 'zustand'

export interface Channel {
    id: string
    serverId: string
    name: string
    type: 'text' | 'voice'
}

interface ChannelState {
    channels: Channel[]
    currentChannelId: string | null
    loading: boolean
    fetchChannels: (serverId: string) => void
    createChannel: (serverId: string, name: string, type: 'text' | 'voice') => void
    setCurrentChannel: (channelId: string) => void
}

const allMockChannels: Channel[] = [
    { id: '1', serverId: '1', name: 'general', type: 'text' },
    { id: '2', serverId: '1', name: 'valorant', type: 'text' },
    { id: '3', serverId: '1', name: 'among-us', type: 'text' },
    { id: '4', serverId: '1', name: 'General Voice', type: 'voice' },
    { id: '5', serverId: '1', name: 'Gaming', type: 'voice' },
    { id: '6', serverId: '2', name: 'general', type: 'text' },
    { id: '7', serverId: '2', name: 'code-review', type: 'text' },
    { id: '8', serverId: '3', name: 'general', type: 'text' },
    { id: '9', serverId: '3', name: 'music-chat', type: 'text' },
]

export const useChannelStore = create<ChannelState>((set) => ({
    channels: [],
    currentChannelId: null,
    loading: false,

    fetchChannels: (serverId: string) => {
        set({ loading: true })
        // Симуляция загрузки
        setTimeout(() => {
            const filtered = allMockChannels.filter((c) => c.serverId === serverId)
            set({ channels: filtered, loading: false })
        }, 100)
    },

    createChannel: (serverId: string, name: string, type: 'text' | 'voice') => {
        const newChannel: Channel = {
            id: Date.now().toString(),
            serverId,
            name,
            type,
        }
        set((state) => ({ channels: [...state.channels, newChannel] }))
    },

    setCurrentChannel: (channelId: string) => {
        set({ currentChannelId: channelId })
    },
}))