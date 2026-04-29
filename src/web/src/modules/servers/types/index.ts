import type { User } from '../../../shared/types'

export interface Server {
    id: string
    name: string
    type: 'game' | 'dev' | 'music' | 'study' | 'friends' | 'default'
    description?: string
    icon?: string
    ownerId: string
    owner?: User
    onlineCount: number
    memberCount: number
    createdAt: Date
}

export interface CreateServerData {
    name: string
    type: string
    description?: string
    icon?: string
}

export interface UpdateServerData {
    name?: string
    description?: string
    icon?: string
}
