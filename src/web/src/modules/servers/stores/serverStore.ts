import { create } from 'zustand'

export interface Server {
    id: string
    name: string
    type: string  // 'game' | 'dev' | 'music' | 'study' | 'friends' | 'default'
    description?: string
    onlineCount: number
    memberCount: number
}

interface ServerState {
    servers: Server[]
    currentServerId: string | null
    loading: boolean
    fetchServers: () => void
    createServer: (name: string, type: string, description?: string) => void
    setCurrentServer: (serverId: string) => void
}

const mockServers: Server[] = [
    { id: '1', name: 'Game Night', type: 'game', description: 'Valorant, Among Us, CS2', onlineCount: 12, memberCount: 50 },
    { id: '2', name: 'Dev Team', type: 'dev', description: 'Обсуждение кода, code-review', onlineCount: 8, memberCount: 24 },
    { id: '3', name: 'Music Lovers', type: 'music', description: 'Новые альбомы, концерты', onlineCount: 5, memberCount: 120 },
]

export const useServerStore = create<ServerState>((set) => ({
    servers: mockServers,
    currentServerId: null,
    loading: false,

    fetchServers: () => {
        set({ loading: true })
        setTimeout(() => {
            set({ servers: mockServers, loading: false })
        }, 500)
    },

    createServer: (name: string, type: string, description?: string) => {
        const newServer: Server = {
            id: Date.now().toString(),
            name,
            type,
            description,
            onlineCount: 1,
            memberCount: 1,
        }
        set((state) => ({ servers: [...state.servers, newServer] }))
    },

    setCurrentServer: (serverId: string) => {
        set({ currentServerId: serverId })
    },
}))