export interface User {
    id: string
    username: string
    email: string
    avatar?: string
    status?: 'online' | 'offline' | 'idle' | 'dnd'
}