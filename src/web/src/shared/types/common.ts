// Общие типы, используемые в нескольких модулях

export interface User {
    id: string
    username: string
    email: string
    avatar?: string
    status?: 'online' | 'offline' | 'idle' | 'dnd'
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    limit: number
}
