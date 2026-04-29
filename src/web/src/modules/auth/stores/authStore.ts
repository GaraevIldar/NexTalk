import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    username: string
    email: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    setUserFromToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Всегда авторизован с тестовым пользователем
            user: { id: '1', username: 'Алексей', email: 'alexey@example.com' },
            token: 'demo-token',
            isAuthenticated: true,

            login: async (email: string, password: string) => {
                // Мок-логин - всегда успешный
                const username = email.split('@')[0]
                set({
                    user: { id: '1', username, email },
                    token: 'demo-token',
                    isAuthenticated: true,
                })
            },

            logout: () => {
                // Очищаем данные при выходе
                set({ user: null, token: null, isAuthenticated: false })
            },

            setUserFromToken: (token: string) => {
                set({
                    token,
                    user: { id: '1', username: 'User', email: 'user@example.com' },
                    isAuthenticated: true,
                })
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)