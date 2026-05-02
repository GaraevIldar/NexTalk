import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {oidcService} from "../oidc/oidcService.ts";

export interface User {
    id: string
    username: string
    email: string
    displayName?: string
    avatar?: string
    emailVerified?: boolean
}

export interface Tokens {
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type?: string
    scope?: string
}

interface AuthState {
    user: User | null
    tokens: Tokens | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

// Асинхронный thunk для логина (редирект на Zitadel)
export const login = createAsyncThunk(
    'auth/login',
    async (_, { dispatch }) => {
        if (import.meta.env.VITE_USE_AUTH_MOCK === 'true') {
            // 👇 имитация запроса
            await new Promise(res => setTimeout(res, 500))

            return {
                user: {
                    id: 'mock-id',
                    username: 'mockuser',
                    email: 'mock@example.com',
                    displayName: 'Mock User',
                    avatar: '',
                    emailVerified: true,
                },
                tokens: {
                    access_token: 'mock-token',
                    expires_in: 3600,
                },
            }
        }

        // 👉 реальный код
        sessionStorage.setItem('return_url', window.location.pathname)
        await oidcService.login()
        return null
    }
)

// Асинхронный thunk для выхода
export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        if (import.meta.env.VITE_USE_AUTH_MOCK === 'true') {
            return null
        }

        await oidcService.logout()
        return null
    }
)

// Асинхронный thunk для инициализации (проверка сохраненной сессии)
export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async () => {
        if (import.meta.env.VITE_USE_AUTH_MOCK === 'true') {
            return {
                user: {
                    id: 'mock-id',
                    username: 'mockuser',
                    email: 'mock@example.com',
                    displayName: 'Mock User',
                },
                tokens: {
                    access_token: 'mock-token',
                    expires_in: 3600,
                },
                isAuthenticated: true,
            }
        }
        const isAuthenticated = oidcService.isAuthenticated()
        const userInfo = oidcService.getUserInfo()
        const accessToken = oidcService.getAccessToken()

        if (isAuthenticated && userInfo && accessToken) {
            return {
                user: {
                    id: userInfo.sub,
                    username: userInfo.preferred_username,
                    email: userInfo.email,
                    displayName: userInfo.name,
                    avatar: userInfo.picture,
                    emailVerified: userInfo.email_verified,
                },
                tokens: {
                    access_token: accessToken,
                    refresh_token: undefined, // Из oidcService можно получить refresh
                    expires_in: 3600,
                },
                isAuthenticated: true,
            }
        }

        return null
    }
)

// Асинхронный thunk для обновления токена
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async () => {
        const tokens = await oidcService.refreshToken()
        return tokens
    }
)

// Асинхронный thunk для обработки callback (обмен code на токены)
export const handleAuthCallback = createAsyncThunk(
    'auth/handleCallback',
    async ({ code, state }: { code: string; state: string }) => {
        const tokens = await oidcService.handleCallback(code, state)
        const userInfo = oidcService.getUserInfo()

        if (!userInfo) {
            throw new Error('User info not loaded')
        }

        return {
            user: {
                id: userInfo.sub,
                username: userInfo.preferred_username,
                email: userInfo.email,
                displayName: userInfo.name,
                avatar: userInfo.picture,
                emailVerified: userInfo.email_verified,
            },
            tokens: {
                access_token: tokens?.access_token,
                refresh_token: tokens?.refresh_token,
                expires_in: tokens?.expires_in,
                token_type: tokens?.token_type,
                scope: tokens?.scope,
            },
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Синхронные actions
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },

        setTokens: (state, action: PayloadAction<Tokens | null>) => {
            state.tokens = action.payload
        },

        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },

        clearAuth: (state) => {
            state.user = null
            state.tokens = null
            state.isAuthenticated = false
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false

            if (action.payload) {
                state.user = action.payload.user
                state.tokens = action.payload.tokens
                state.isAuthenticated = true
            }
        })
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.error.message || 'Login failed'
        })

        // Initialize
        builder.addCase(initializeAuth.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(initializeAuth.fulfilled, (state, action) => {
            state.isLoading = false
            if (action.payload) {
                state.user = action.payload.user
                state.tokens = action.payload.tokens
                state.isAuthenticated = true
            }
        })
        builder.addCase(initializeAuth.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.error.message || 'Initialization failed'
        })

        // Handle callback
        builder.addCase(handleAuthCallback.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(handleAuthCallback.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.tokens = action.payload.tokens
            state.isAuthenticated = true
            state.error = null
        })
        builder.addCase(handleAuthCallback.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.error.message || 'Callback handling failed'
        })

        // Refresh token
        builder.addCase(refreshToken.fulfilled, (state, action) => {
            if (state.tokens) {
                state.tokens.access_token = action.payload.access_token
                if (action.payload.refresh_token) {
                    state.tokens.refresh_token = action.payload.refresh_token
                }
                state.tokens.expires_in = action.payload.expires_in
            }
        })
        builder.addCase(refreshToken.rejected, (state) => {
            // Если не удалось обновить токен - разлогиниваем
            state.user = null
            state.tokens = null
            state.isAuthenticated = false
        })

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null
            state.tokens = null
            state.isAuthenticated = false
            state.error = null
        })
    },
})

// Экспорт actions
export const {
    setUser,
    setTokens,
    setAuthenticated,
    setLoading,
    setError,
    clearAuth,
} = authSlice.actions

// Экспорт reducer
export default authSlice.reducer

// Селекторы
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.tokens?.access_token